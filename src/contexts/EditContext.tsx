import { createContext, useContext, useState, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface EditContextType {
  editMode: boolean;
  toggleEditMode: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editMode, setEditMode] = useState(searchParams.get('edit') === 'true');

  const toggleEditMode = () => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);
    if (newEditMode) {
      setSearchParams({ edit: 'true' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <EditContext.Provider value={{ editMode, toggleEditMode }}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = () => {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
};
