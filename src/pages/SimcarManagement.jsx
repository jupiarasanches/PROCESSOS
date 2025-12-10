import { useState, useEffect, useCallback } from 'react';
import { SimcarService } from '@/services';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { differenceInDays, startOfDay, parseISO } from "date-fns";
import { toast } from "sonner";
import _ from 'lodash';

const PENDENCY_STATUSES = [
  { value: 'Aprovado', label: 'Aprovado', color: 'bg-black text-white' }, // Preto
  { value: 'À realizar', label: 'À realizar', color: 'bg-blue-600 text-white' }, // Azul
  { value: 'Vencido/Suspenso', label: 'Vencido/Suspenso', color: 'bg-pink-700 text-white' }, // Rosa Escuro
  { value: 'Enviado', label: 'Enviado', color: 'bg-green-700 text-white' }, // Verde Escuro
  { value: 'Em andamento', label: 'Em andamento', color: 'bg-yellow-100 text-yellow-900' } // Amarelo Claro
];

const PROCESS_TYPES = [
  'CAR',
  'CAR Novo',
  'PRA',
  'PRA Novo',
  'CAR em Retificação',
  'CAR Digital'
];

const CAR_PATTERN = /^MT\d+\/\d{4}$/i;
const CAR_LIKE_PATTERN = /^MT[-\s]?\d+(?:\/\d{2,4})?$/i;

// Componente para cada linha da tabela
function SimcarRow({ process, onSave }) {
  const [formData, setFormData] = useState({
    car_number: process.car_number || '',
    property_name: process.property_name || '',
    process_type: process.process_type || '',
    analysis_date: process.analysis_date || '',
    simcar_due_date: process.simcar_due_date || '',
    pendency_status: process.pendency_status || '',
    simcar_technician: process.simcar_technician || '',
    last_submission_date: process.last_submission_date || '',
    notes: process.notes || '',
  });

  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({ car: false, property: false });

  useEffect(() => {
    if (formData.simcar_due_date) {
      // Cria a data de vencimento ajustando para meia-noite local para evitar problemas de fuso horário
      // Adicionamos 'T00:00:00' para garantir que a data seja tratada como local e não UTC
      const due = new Date(formData.simcar_due_date + 'T00:00:00');
      
      // Data de hoje zerada (meia-noite)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calcula a diferença
      setDaysRemaining(differenceInDays(due, today));
    } else {
      setDaysRemaining(null);
    }
  }, [formData.simcar_due_date]);

  // Função para salvar automaticamente
  const autoSave = async (data) => {
    setIsSaving(true);
    await onSave(process.id, {
      ...data,
      days_remaining: daysRemaining // Note: daysRemaining might be stale if inside closure, but typically updated by effect
    });
    setIsSaving(false);
  };

  // Debounced save para campos de texto
  const debouncedSave = useCallback(
    _.debounce((data) => {
      autoSave(data);
    }, 1000),
    [process.id] // Re-create debounce if ID changes (unlikely)
  );

  const handleChange = (field, value) => {
    let v = value;
    let newData = { ...formData };

    if (field === 'car_number') {
      v = v.toUpperCase().replace(/\s+/g, '');
      newData.car_number = v;
      const valid = CAR_PATTERN.test(v);
      setErrors(prev => ({ ...prev, car: !valid }));
      setFormData(newData);
      if (valid) {
        debouncedSave({ ...newData });
      }
      return;
    }

    if (field === 'property_name') {
      const val = value;
      if (CAR_LIKE_PATTERN.test(val)) {
        const carVal = val.toUpperCase().replace(/\s+/g, '');
        if (!newData.car_number || newData.car_number !== carVal) {
          newData.car_number = carVal;
        }
        newData.property_name = '';
        setErrors(prev => ({ ...prev, property: true, car: false }));
        setFormData(newData);
        debouncedSave({ ...newData });
        toast.info('Valor do CAR movido para o campo CAR');
        return;
      }
      const invalid = val.trim().length === 0 || CAR_LIKE_PATTERN.test(val);
      newData.property_name = val;
      setErrors(prev => ({ ...prev, property: invalid }));
      setFormData(newData);
      if (!invalid) {
        debouncedSave({ ...newData });
      }
      return;
    }

    newData[field] = value;
    setFormData(newData);
    autoSave(newData);
  };

  const getDaysRemainingColor = (days) => {
    if (days === null) return 'text-gray-700';
    if (days <= 0) return 'text-red-800 font-black bg-red-100 px-2 py-1 rounded'; 
    if (days <= 29) return 'text-red-600 bg-red-50 px-2 py-1 rounded'; 
    if (days <= 59) return 'text-green-600 bg-green-50 px-2 py-1 rounded'; 
    if (days <= 90) return 'text-white bg-green-700 px-2 py-1 rounded'; 
    return 'text-gray-700'; 
  };

  const getStatusColor = (status) => {
    const found = PENDENCY_STATUSES.find(s => s.value === status);
    return found ? found.color : 'bg-white';
  };

  return (
    <TableRow>
      {/* CAR */}
      <TableCell className="text-center">
        <div className="flex flex-col items-center">
          <Input 
            value={formData.car_number} 
            onChange={(e) => handleChange('car_number', e.target.value)}
            placeholder="MT0000/2025"
            className={`h-8 bg-white min-w-[140px] text-center ${errors.car ? 'border-red-500' : ''}`}
          />
          {errors.car && (
            <span className="text-xs text-red-600 mt-1">Formato: MT7845/2025</span>
          )}
        </div>
      </TableCell>

      {/* Proprietário */}
      <TableCell className="text-center">
        <span className="text-gray-700 text-sm whitespace-nowrap">{process.client_company || '-'}</span>
      </TableCell>

      {/* Propriedade */}
      <TableCell className="text-center">
        <div className="flex flex-col items-center">
          <Input 
            value={formData.property_name} 
            onChange={(e) => handleChange('property_name', e.target.value)}
            placeholder="Ex: Fazenda Eldorado I"
            className={`h-8 bg-white min-w-[170px] text-center ${errors.property ? 'border-red-500' : ''}`}
          />
          {errors.property && (
            <span className="text-xs text-red-600 mt-1">Informe o nome do imóvel rural</span>
          )}
        </div>
      </TableCell>

      {/* Tipo */}
      <TableCell className="text-center">
        <Select 
          value={formData.process_type} 
          onValueChange={(val) => handleChange('process_type', val)}
        >
          <SelectTrigger className="h-8 w-[160px] border-gray-200 bg-white mx-auto">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {PROCESS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Data Análise */}
      <TableCell className="text-center">
        <Input 
          type="date"
          value={formData.analysis_date} 
          onChange={(e) => handleChange('analysis_date', e.target.value)}
          className="h-8 bg-white w-[130px] text-center mx-auto"
        />
      </TableCell>

      {/* Data Vencimento */}
      <TableCell className="text-center">
        <Input 
          type="date"
          value={formData.simcar_due_date} 
          onChange={(e) => handleChange('simcar_due_date', e.target.value)}
          className="h-8 bg-white w-[130px] text-center mx-auto"
        />
      </TableCell>

      {/* Situação Pendência (Select) */}
      <TableCell className="text-center">
        <Select 
          value={formData.pendency_status} 
          onValueChange={(val) => handleChange('pendency_status', val)}
        >
          <SelectTrigger className={`h-8 w-[180px] ${getStatusColor(formData.pendency_status)} border-gray-200 mx-auto`}>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {PENDENCY_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Resp. Técnico */}
      <TableCell className="text-center">
        <Input 
          value={formData.simcar_technician} 
          onChange={(e) => handleChange('simcar_technician', e.target.value)}
          className="h-8 bg-white min-w-[150px] text-center"
        />
      </TableCell>

      {/* Dias Restantes */}
      <TableCell className="text-center">
        <div className="flex justify-center">
          <span className={`font-bold text-sm whitespace-nowrap ${getDaysRemainingColor(daysRemaining)}`}>
            {daysRemaining !== null ? `${daysRemaining} dias` : '-'}
          </span>
        </div>
      </TableCell>

      {/* Último Envio */}
      <TableCell className="text-center">
        <Input 
          type="date"
          value={formData.last_submission_date} 
          onChange={(e) => handleChange('last_submission_date', e.target.value)}
          className="h-8 bg-white w-[130px] text-center mx-auto"
        />
      </TableCell>

      {/* Observações */}
      <TableCell className="text-center">
        <div className="relative">
           <Textarea 
            value={formData.notes} 
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[32px] h-8 py-1 bg-white w-[200px] text-xs resize-none mx-auto leading-tight"
            placeholder="Obs..."
          />
          {isSaving && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
               <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SimcarManagement() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem('simcar_status_filter') || 'all';
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    localStorage.setItem('simcar_status_filter', value);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await SimcarService.getSimcarProcesses();
      setProcesses(data);
    } catch (error) {
      toast.error("Erro ao carregar processos SIMCAR");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRow = async (instanceId, data) => {
    try {
      // Atualiza no banco
      await SimcarService.updateSimcarDetails(instanceId, {
        car_number: data.car_number,
        property_name: data.property_name,
        process_type: data.process_type,
        analysis_date: data.analysis_date || null,
        due_date: data.simcar_due_date || null,
        pendency_status: data.pendency_status,
        technician_responsible: data.simcar_technician,
        days_remaining: data.days_remaining,
        last_submission_date: data.last_submission_date || null,
        notes: data.notes
      });
      
      // Atualiza estado local imediatamente para refletir na busca/filtro
      setProcesses(prev => prev.map(p => {
        if (p.id === instanceId) {
          return {
            ...p,
            ...data,
            simcar_due_date: data.simcar_due_date, // mapeando nomes de campos do form para o objeto process
            pendency_status: data.pendency_status,
            // garantindo que todos os campos atualizados estejam no objeto process
            car_number: data.car_number,
            property_name: data.property_name,
            process_type: data.process_type,
            analysis_date: data.analysis_date,
            simcar_technician: data.simcar_technician,
            last_submission_date: data.last_submission_date,
            notes: data.notes
          };
        }
        return p;
      }));

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar dados");
    }
  };

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.car_number && p.car_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.property_name && p.property_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.process_type && p.process_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.simcar_technician && p.simcar_technician.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.client_company && p.client_company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.pendency_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento SIMCAR</h1>
          <p className="text-gray-500">Acompanhamento de processos SIMCAR</p>
        </div>
          <div className="flex gap-2 items-center">
            <Select 
              value={statusFilter} 
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[200px] bg-white border-gray-200">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {PENDENCY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] text-center whitespace-nowrap">CAR</TableHead>
                <TableHead className="w-[150px] text-center whitespace-nowrap">Proprietário</TableHead>
                <TableHead className="w-[150px] text-center whitespace-nowrap">Propriedade</TableHead>
                <TableHead className="w-[160px] text-center whitespace-nowrap">Tipo</TableHead>
                <TableHead className="w-[130px] text-center whitespace-nowrap">Data Análise</TableHead>
                <TableHead className="w-[130px] text-center whitespace-nowrap">Vencimento</TableHead>
                <TableHead className="w-[200px] text-center whitespace-nowrap">Situação de atendimento à pendência</TableHead>
                <TableHead className="w-[150px] text-center whitespace-nowrap">Resp. Técnico</TableHead>
                <TableHead className="w-[100px] text-center whitespace-nowrap">Dias Rest.</TableHead>
                <TableHead className="w-[130px] text-center whitespace-nowrap">Último envio</TableHead>
                <TableHead className="w-[200px] text-center whitespace-nowrap">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : filteredProcesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    Nenhum processo SIMCAR encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcesses.map((process) => (
                  <SimcarRow 
                    key={process.id} 
                    process={process} 
                    onSave={handleSaveRow} 
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
