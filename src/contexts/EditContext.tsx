import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface EditContextType {
  editMode: boolean;
  toggleEditMode: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Edit mode only works if user is admin
  const [editMode, setEditMode] = useState(
    searchParams.get('edit') === 'true' && isAdmin
  );

  const toggleEditMode = () => {
    if (!isAdmin) {
      console.warn('Edit mode requires admin privileges');
      return;
    }
    
    const newEditMode = !editMode;
    setEditMode(newEditMode);
    if (newEditMode) {
      setSearchParams({ edit: 'true' });
    } else {
      setSearchParams({});
    }
  };
  
  // Monitor admin status changes and disable edit mode if user loses admin privileges
  useEffect(() => {
    if (!loading && !isAdmin && editMode) {
      setEditMode(false);
      setSearchParams({});
    }
  }, [isAdmin, loading, editMode, setSearchParams]);
  
  // Update edit mode when admin status becomes available
  useEffect(() => {
    if (!loading && searchParams.get('edit') === 'true' && isAdmin && !editMode) {
      setEditMode(true);
    }
  }, [isAdmin, loading, searchParams, editMode]);

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
