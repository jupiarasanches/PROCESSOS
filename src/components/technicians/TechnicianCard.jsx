 
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, Trash2, Star } from "lucide-react";

const departmentColors = {
  ambiental: "bg-green-100 text-green-800",
  agronegocio: "bg-lime-100 text-lime-800", 
  operacional: "bg-blue-100 text-blue-800",
  juridico: "bg-purple-100 text-purple-800",
  qualidade: "bg-indigo-100 text-indigo-800",
  administrativo: "bg-gray-100 text-gray-800"
};

export default function TechnicianCard({ technician, onEdit, onDelete, onToggleAdmin, onResendInvite, onGenerateLink }) {
  const departmentColor = departmentColors[technician?.department] || departmentColors.administrativo;
  const displayName = technician?.full_name || technician?.email || "";
  const initials = (displayName.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("") || displayName[0]?.toUpperCase() || "?");
  
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-blue-600 text-lg">
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{displayName || "Técnico"}</h3>
            {technician?.position && (
              <p className="text-sm text-gray-500">{technician.position}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{technician?.email || "—"}</span>
          </div>
          {technician.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{technician.phone}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${departmentColor} capitalize`}>{technician?.department || "administrativo"}</Badge>
          {technician.role === 'admin' && (
            <Badge variant="outline" className="border-yellow-400 text-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-4 border-t pt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(technician)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {technician?.status === 'invited' && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => onResendInvite?.(technician)}>
              Reenviar Convite
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => onGenerateLink?.(technician)}>
            Gerar Link de Acesso
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onToggleAdmin(technician)}>
            {technician.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
          </Button>
          <Button variant="outline" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(technician)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

TechnicianCard.propTypes = {
  technician: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleAdmin: PropTypes.func.isRequired,
  onResendInvite: PropTypes.func,
  onGenerateLink: PropTypes.func,
}
