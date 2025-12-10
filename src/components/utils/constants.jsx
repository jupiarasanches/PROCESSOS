// Status configurations
export const STATUS_CONFIG = {
  aguardando_analise: {
    title: "Aguardando Análise",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-yellow-700 border border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-800",
    icon: "Clock",
    iconColor: "text-yellow-600",
    accentBorder: "border-l-yellow-500"
  },
  em_andamento: {
    title: "Em Andamento",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-blue-700 border border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: "Play",
    iconColor: "text-blue-600",
    accentBorder: "border-l-blue-500"
  },
  pendente: {
    title: "Pendente", 
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-orange-700 border border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    icon: "Pause",
    iconColor: "text-orange-600",
    accentBorder: "border-l-orange-500"
  },
  finalizado: {
    title: "Finalizado/Protocolado",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-green-700 border border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    icon: "CheckCircle",
    iconColor: "text-green-600",
    accentBorder: "border-l-green-500"
  },
  cancelado: {
    title: "Cancelados",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-red-700 border border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    icon: "X",
    iconColor: "text-red-600",
    accentBorder: "border-l-red-500"
  }
};

export const PRIORITY_COLORS = {
  baixa: "bg-gray-100 text-gray-700",
  media: "bg-orange-100 text-orange-700",
  alta: "bg-red-100 text-red-700",
  critica: "bg-red-200 text-red-800"
};

export const CATEGORY_COLORS = {
  ambiental: "bg-green-100 text-green-800",
  agronegocio: "bg-lime-100 text-lime-800", 
  operacional: "bg-blue-100 text-blue-800",
  juridico: "bg-purple-100 text-purple-800",
  qualidade: "bg-indigo-100 text-indigo-800",
  administrativo: "bg-gray-100 text-gray-800",
  agrimensura_topografico: "bg-sky-100 text-sky-800",
  regularizacao_fundiaria: "bg-teal-100 text-teal-800"
};

export const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  allowedExtensions: ['.pdf', '.jpeg', '.jpg', '.png']
};
