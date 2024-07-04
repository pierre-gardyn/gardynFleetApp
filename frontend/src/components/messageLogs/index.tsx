import React, { useCallback, useState } from "react";

export interface MessageLog {
  id: string;
  text: string;
}

// Define the type for the component's props
interface MessageLogsProps {
  logs: MessageLog[];
}
function getRandomId() {
  // Generate a random number between 1 and 999999
  const randomNumber = Math.floor(Math.random() * 999999) + 1;

  // Convert the number to a string and pad with leading zeros to make it 6 digits
  const paddedNumber = randomNumber.toString().padStart(6, "0");

  return paddedNumber;
}

const MessageLogs: React.FC<MessageLogsProps> = ({ logs }) => {
  return (
    <div className="mt-4">
      {logs.map((l) => (
        <p key={l.id}>{l.text}</p>
      ))}
    </div>
  );
};

export function useLogs() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const addLog = useCallback((log: string) => {
    setLogs((logs) => [...logs, { id: getRandomId(), text: log }]);
  }, []);

  const clear = useCallback(() => {
    setLogs([]);
  }, []);
  return { logs, addLog, clear };
}

export default MessageLogs;
