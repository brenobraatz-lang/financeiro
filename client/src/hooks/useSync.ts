import { useEffect } from 'react';
import { connectSocket } from '../services/socket';
import { Despesa } from '../types/Despesa';

interface UseSyncProps {
  onDespesaCriada?: (despesa: Despesa) => void;
  onDespesaAtualizada?: (despesa: Despesa) => void;
  onDespesaDeletada?: (id: number) => void;
  onEntradaCriada?: (entrada: any) => void;
  onEntradaAtualizada?: (entrada: any) => void;
  onEntradaDeletada?: (id: number) => void;
}

export const useSync = ({
  onDespesaCriada,
  onDespesaAtualizada,
  onDespesaDeletada,
  onEntradaCriada,
  onEntradaAtualizada,
  onEntradaDeletada,
}: UseSyncProps) => {
  useEffect(() => {
    const socket = connectSocket();

    // Listeners para despesas
    socket.on('despesa:criada', (despesa: Despesa) => {
      console.log('📨 Despesa criada em outro cliente:', despesa);
      onDespesaCriada?.(despesa);
    });

    socket.on('despesa:atualizada', (despesa: Despesa) => {
      console.log('📨 Despesa atualizada em outro cliente:', despesa);
      onDespesaAtualizada?.(despesa);
    });

    socket.on('despesa:deletada', (data: { id: number }) => {
      console.log('📨 Despesa deletada em outro cliente:', data.id);
      onDespesaDeletada?.(data.id);
    });

    // Listeners para entradas de caixa
    socket.on('entrada:criada', (entrada: any) => {
      console.log('📨 Entrada de caixa criada em outro cliente:', entrada);
      onEntradaCriada?.(entrada);
    });

    socket.on('entrada:atualizada', (entrada: any) => {
      console.log('📨 Entrada de caixa atualizada em outro cliente:', entrada);
      onEntradaAtualizada?.(entrada);
    });

    socket.on('entrada:deletada', (data: { id: number }) => {
      console.log('📨 Entrada de caixa deletada em outro cliente:', data.id);
      onEntradaDeletada?.(data.id);
    });

    // Cleanup
    return () => {
      socket.off('despesa:criada');
      socket.off('despesa:atualizada');
      socket.off('despesa:deletada');
      socket.off('entrada:criada');
      socket.off('entrada:atualizada');
      socket.off('entrada:deletada');
    };
  }, [onDespesaCriada, onDespesaAtualizada, onDespesaDeletada, onEntradaCriada, onEntradaAtualizada, onEntradaDeletada]);
};
