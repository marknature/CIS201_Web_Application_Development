import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CONFIG } from "../config";
import {
  addTicketNoteInState,
  assignTicketInState,
  createTicketInState,
  hydrateDemoState,
  markNotificationReadInState,
  resetDemoState,
  updateTicketStatusInState,
  type AddTicketNoteInput,
  type AssignTicketInput,
  type CreateTicketInput,
  type UpdateTicketStatusInput,
} from "../data/demoState";
import { type Asset, type DemoState, type Notification, type Ticket, type User } from "../data/mockData";

interface DemoDataContextType {
  assets: Asset[];
  notifications: Notification[];
  technicians: User[];
  tickets: Ticket[];
  users: User[];
  createTicket: (input: CreateTicketInput) => Ticket | null;
  assignTicket: (input: AssignTicketInput) => Ticket | null;
  updateTicketStatus: (input: UpdateTicketStatusInput) => Ticket | null;
  addTicketNote: (input: AddTicketNoteInput) => Ticket | null;
  markNotificationRead: (notificationId: string) => void;
  resetDemoData: () => void;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

const loadStoredState = (): DemoState => {
  if (typeof window === "undefined") {
    return resetDemoState();
  }

  try {
    const rawState = window.localStorage.getItem(CONFIG.STORAGE_KEYS.demoState);
    if (!rawState) {
      return resetDemoState();
    }

    return hydrateDemoState(JSON.parse(rawState) as Partial<DemoState>);
  } catch {
    return resetDemoState();
  }
};

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadStoredState);

  useEffect(() => {
    window.localStorage.setItem(CONFIG.STORAGE_KEYS.demoState, JSON.stringify(state));
  }, [state]);

  const createTicket = (input: CreateTicketInput) => {
    let nextTicket: Ticket | null = null;
    setState((currentState) => {
      const nextState = createTicketInState(currentState, input);
      nextTicket = nextState.tickets[0] || null;
      return nextState;
    });
    return nextTicket;
  };

  const assignTicket = (input: AssignTicketInput) => {
    let updatedTicket: Ticket | null = null;
    setState((currentState) => {
      const nextState = assignTicketInState(currentState, input);
      updatedTicket = nextState.tickets.find((ticket) => ticket.id === input.ticketId) || null;
      return nextState;
    });
    return updatedTicket;
  };

  const updateTicketStatus = (input: UpdateTicketStatusInput) => {
    let updatedTicket: Ticket | null = null;
    setState((currentState) => {
      const nextState = updateTicketStatusInState(currentState, input);
      updatedTicket = nextState.tickets.find((ticket) => ticket.id === input.ticketId) || null;
      return nextState;
    });
    return updatedTicket;
  };

  const addTicketNote = (input: AddTicketNoteInput) => {
    let updatedTicket: Ticket | null = null;
    setState((currentState) => {
      const nextState = addTicketNoteInState(currentState, input);
      updatedTicket = nextState.tickets.find((ticket) => ticket.id === input.ticketId) || null;
      return nextState;
    });
    return updatedTicket;
  };

  const markNotificationRead = (notificationId: string) => {
    setState((currentState) => markNotificationReadInState(currentState, notificationId));
  };

  const resetData = () => {
    setState(resetDemoState());
  };

  return (
    <DemoDataContext.Provider
      value={{
        assets: state.assets,
        notifications: state.notifications,
        technicians: state.users.filter((user) => user.role === "technician"),
        tickets: state.tickets,
        users: state.users,
        createTicket,
        assignTicket,
        updateTicketStatus,
        addTicketNote,
        markNotificationRead,
        resetDemoData: resetData,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }

  return context;
}
