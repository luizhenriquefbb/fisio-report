import { motion } from "motion/react";
import {
  Download,
  Activity,
  Users,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Check,
  Monitor,
  Apple,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import exampleImage from "@designs/dashboard.png";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

interface DownloadButtonProps {
  os: string;
  icon: LucideIcon;
  delay: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#1a2744] flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-[#1a2744] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function DownloadButton({ os, icon: Icon, delay }: DownloadButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        size="lg"
        className="bg-gradient-to-r from-[#06b6d4] to-[#1a2744] hover:from-[#0891b2] hover:to-[#0f172a] text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Icon className="w-5 h-5 mr-2" />
        Download para {os}
      </Button>
    </motion.div>
  );
}

export default function LandingPage() {
  const features = [
    {
      icon: Activity,
      title: "Dashboard Inteligente",
      description:
        "Visualize o status clínico de todo o elenco em tempo real. Edite informações rapidamente direto na tabela com apenas alguns cliques.",
    },
    {
      icon: Users,
      title: "Gestão de Atletas",
      description:
        "Cadastro completo de jogadores com foto, posição e histórico detalhado. Organize seu elenco de forma profissional.",
    },
    {
      icon: FileText,
      title: "Catálogo Clínico",
      description:
        "Gerencie queixas, tratamentos e períodos de trabalho de forma estruturada e organizada. Tudo em um só lugar.",
    },
    {
      icon: BarChart3,
      title: "Relatórios Diários",
      description:
        "Agrupamento automático de registros por data com estatísticas mensais completas de atendimento e evolução.",
    },
    {
      icon: Shield,
      title: "Proteção de Dados",
      description:
        "Sistema de integridade que impede a exclusão acidental de itens com histórico clínico vinculado.",
    },
    {
      icon: Zap,
      title: "Alta Performance",
      description:
        "Aplicação desktop otimizada para velocidade máxima. Substitua planilhas lentas por uma interface ágil e intuitiva.",
    },
  ];

  const benefits = [
    "Economize horas de trabalho manual todos os dias",
    "Elimine erros de digitação em planilhas",
    "Acesse dados históricos instantaneamente",
    "Gere relatórios profissionais em segundos",
    "Organize todo o departamento médico",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 via-transparent to-[#1a2744]/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-8"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#1a2744] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1a2744] font-semibold">FisioReport</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-[#1a2744] mb-6 leading-tight"
            >
              Gestão Clínica Esportiva
              <br />
              <span className="bg-gradient-to-r from-[#06b6d4] to-[#1a2744] bg-clip-text text-transparent">
                Rápida e Profissional
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              A solução completa para fisioterapeutas de clubes de futebol.
              Substitua planilhas manuais por uma interface intuitiva e ganhe
              tempo para o que realmente importa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-16"
            >
              <DownloadButton os="Windows" icon={Monitor} delay={0.7} />
              <DownloadButton os="Mac" icon={Apple} delay={0.8} />
              <DownloadButton os="Linux" icon={Download} delay={0.9} />
            </motion.div>
          </div>

          {/* Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/20 to-[#1a2744]/20 rounded-3xl blur-3xl" />
            <img
              src={exampleImage}
              alt="FisioReport Dashboard"
              className="relative rounded-2xl shadow-2xl border-8 border-white w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2744] mb-6">
              Por que escolher o FisioReport?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desenvolvido especificamente para atender as necessidades do
              departamento médico de clubes de futebol profissional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg text-gray-700">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a2744] mb-6">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar o departamento médico de
              forma eficiente e profissional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#1a2744] to-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para revolucionar sua gestão clínica?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Baixe agora e comece a economizar horas de trabalho todos os dias.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <DownloadButton os="Windows" icon={Monitor} delay={0.2} />
              <DownloadButton os="Mac" icon={Apple} delay={0.3} />
              <DownloadButton os="Linux" icon={Download} delay={0.4} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#1a2744] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#1a2744] font-semibold text-lg">
              FisioReport
            </span>
          </div>
          <p className="text-gray-600">
            Gestão clínica profissional para departamentos médicos de clubes de
            futebol.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            © 2026 FisioReport. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
