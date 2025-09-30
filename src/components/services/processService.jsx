import { Process, ProcessInstance } from "@/api/entities";

export class ProcessService {
  static async getAllProcesses() {
    try {
      return await Process.list('-created_date');
    } catch (error) {
      console.error('Error fetching processes:', error);
      throw new Error('Falha ao carregar processos');
    }
  }

  static async createProcess(data) {
    try {
      return await Process.create(data);
    } catch (error) {
      console.error('Error creating process:', error);
      throw new Error('Falha ao criar processo');
    }
  }

  static async updateProcess(id, data) {
    try {
      return await Process.update(id, data);
    } catch (error) {
      console.error('Error updating process:', error);
      throw new Error('Falha ao atualizar processo');
    }
  }

  static async deleteProcess(id) {
    try {
      return await Process.delete(id);
    } catch (error) {
      console.error('Error deleting process:', error);
      throw new Error('Falha ao deletar processo');
    }
  }
}

export class ProcessInstanceService {
  static async getAllInstances(limit = 50) {
    try {
      return await ProcessInstance.list('-created_date', limit);
    } catch (error) {
      console.error('Error fetching process instances:', error);
      throw new Error('Falha ao carregar instâncias de processo');
    }
  }

  static async createInstance(data) {
    try {
      return await ProcessInstance.create(data);
    } catch (error) {
      console.error('Error creating process instance:', error);
      throw new Error('Falha ao criar instância de processo');
    }
  }

  static async updateInstance(id, data) {
    try {
      return await ProcessInstance.update(id, data);
    } catch (error) {
      console.error('Error updating process instance:', error);
      throw new Error('Falha ao atualizar instância de processo');
    }
  }

  static async deleteInstance(id) {
    try {
      return await ProcessInstance.delete(id);
    } catch (error) {
      console.error('Error deleting process instance:', error);
      throw new Error('Falha ao deletar instância de processo');
    }
  }
}