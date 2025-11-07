import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { useEdit } from '@/contexts/EditContext';

export const EditModeToggle = () => {
  const { editMode, toggleEditMode } = useEdit();

  return (
    <Button
      onClick={toggleEditMode}
      variant={editMode ? "default" : "outline"}
      className="font-handwritten border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
    >
      <Edit3 size={16} className="mr-2" />
      {editMode ? "Exit Editor" : "Edit Mode"}
    </Button>
  );
};
