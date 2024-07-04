import React, { useCallback, useState } from "react";

export interface MessageLog {
  text: string;
}

// Define the type for the component's props
interface MessageLogsProps {
  logs: MessageLog[];
}

const MessageLogs: React.FC<MessageLogsProps> = ({ logs }) => {
  return (
    <div className="mt-4">
      {logs.map((l) => (
        <p>{l.text}</p>
      ))}
    </div>
  );
};

export function useLogs() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const addLog = useCallback(
    (log: string) => {
      const allLogs = [...logs];
      allLogs.push({ text: log });
      setLogs(allLogs);
    },
    [logs]
  );

  const clear = useCallback(() => {
    setLogs([]);
  }, []);
  return { logs, addLog, clear };
}

export default MessageLogs;
