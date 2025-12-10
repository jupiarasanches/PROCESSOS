// Cliente mock para substituir o Base44 SDK
// Este arquivo fornece implementações locais das funcionalidades que estavam no Base44

import mockClient from './mockClient';

// Exportar o cliente mock como se fosse o Base44
export const base44 = mockClient;

// Exportar como padrão também
export default { base44 };
