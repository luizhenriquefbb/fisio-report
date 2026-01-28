terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# --- Variáveis ---
variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "account_id" {
  type = string
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}


# --- [1/4] Banco de Dados D1 ---
resource "cloudflare_d1_database" "fisioreport_db" {
  account_id = var.account_id
  name       = "fisioreport-db"
}

# resource "null_resource" "db_migrations" {
#   # Só roda depois que o banco for criado com sucesso
#   depends_on = [cloudflare_d1_database.fisioreport_db]

#   triggers = {
#     # Roda se o schema.sql mudar
#     schema_hash = filebase64sha256("${path.module}/../backend/schema.sql")
#   }

#   provisioner "local-exec" {
#     # Usamos o wrangler para aplicar o schema remotamente
#     command = "cd ${path.module}/../backend && npx wrangler d1 execute ${cloudflare_d1_database.fisioreport_db.name} --remote --file=schema.sql --yes"

#     environment = {
#       CLOUDFLARE_ACCOUNT_ID = var.account_id
#       CLOUDFLARE_API_TOKEN  = var.cloudflare_api_token
#     }
#   }
# }

# --- [2/4] Backend (Worker) ---

resource "null_resource" "worker_build_pre" {
  triggers = {
    # Isso faz o build rodar apenas se o código mudar (evita builds infinitos)
    code_diff = sha1(join("", [for f in fileset("${path.module}/../backend/src", "**") : filesha1("${path.module}/../backend/src/${f}")]))
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../backend && npm install && npm run build"
  }
}

resource "cloudflare_workers_script" "backend_api" {
  account_id = var.account_id
  name       = "fisioreport-backend"
  content    = file("${path.module}/../backend/dist/index.js")

  module              = true
  compatibility_flags = ["nodejs_compat"]
  compatibility_date  = "2025-03-07"

  plain_text_binding {
    name = "JWT_SECRET"
    text = var.jwt_secret
  }

  d1_database_binding {
    name        = "DB"
    database_id = cloudflare_d1_database.fisioreport_db.id
  }

  depends_on = [null_resource.worker_build_pre]
}

resource "null_resource" "worker_build_pos" {
  triggers = {
    # Isso faz o build rodar apenas se o código mudar (evita builds infinitos)
    code_diff = sha1(join("", [for f in fileset("${path.module}/../backend/src", "**") : filesha1("${path.module}/../backend/src/${f}")]))
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../backend && npm run deploy"
  }

  depends_on = [cloudflare_workers_script.backend_api]
}

# --- [3/4] Landing Page (Pages) ---
resource "cloudflare_pages_project" "landing_page" {
  account_id        = var.account_id
  name              = "fisioreport-landing"
  production_branch = "main"

  # O Terraform não faz o "upload" dos arquivos estáticos diretamente tão bem quanto o Wrangler,
  # mas ele gerencia a existência do projeto e integrações.
}

resource "null_resource" "landing_page_build" {
  triggers = {
    code_diff = sha1(join("", [for f in fileset("${path.module}/../src-landing-page/dist", "**") : filesha1("${path.module}/../src-landing-page/dist/${f}")]))
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../src-landing-page && npm install && npm run build && npm run deploy"
  }

  depends_on = [cloudflare_pages_project.landing_page]
}

# --- [4/4] SaaS App (Pages) ---
resource "cloudflare_pages_project" "saas_app" {
  account_id        = var.account_id
  name              = "fisioreport-app"
  production_branch = "main"
}

resource "null_resource" "saas_app_build" {
  triggers = {
    code_diff = sha1(join("", [for f in fileset("${path.module}/../src", "**") : filesha1("${path.module}/../src/${f}")]))
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../src && npm install && npm run build && npm run deploy"
  }

  depends_on = [cloudflare_pages_project.saas_app]
}
