import { useState, useEffect } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  multiline?: boolean;
}

export const EditableText = ({ 
  value, 
  onSave, 
  className = '', 
  as: Component = 'p',
  multiline = false 
}: EditableTextProps) => {
  const { editMode } = useEdit();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSave = async () => {
    if (text === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(text);
      toast({
        title: "Saved!",
        description: "Content updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
      setText(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };

  if (!editMode || !isAdmin || !isEditing) {
    return (
      <Component 
        className={`${className} ${editMode && isAdmin ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-yellow-400 hover:outline-dashed transition-all' : ''}`}
        onClick={() => editMode && isAdmin && setIsEditing(true)}
      >
        {text}
      </Component>
    );
  }

  if (multiline) {
    return (
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className={`${className} border-2 border-yellow-400 bg-yellow-50 focus:outline-none focus:border-yellow-500 p-2 rounded resize-none`}
        autoFocus
        rows={4}
      />
    );
  }

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      disabled={isSaving}
      className={`${className} border-2 border-yellow-400 bg-yellow-50 focus:outline-none focus:border-yellow-500 p-2 rounded`}
      autoFocus
    />
  );
};
