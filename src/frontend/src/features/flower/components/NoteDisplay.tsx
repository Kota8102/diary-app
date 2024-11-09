import { useNavigate } from 'react-router-dom'

import { pencil } from '@/assets/icons'

type NoteProps = {
  note: string;
  date: string;
}
export const NoteDisplay = ({ note, date }: NoteProps) => {
  const navigate = useNavigate();

  const handleEdit = (): void => {
    navigate(`/diary/${date}`);
  };

  return (
    <div className="flex flex-col gap-1">
      <p>Note</p>
      <div className="relative">
        <textarea
          className="bg-light-bgText rounded-md px-3 py-2 tracking-widest min-h-24 w-full resize-none text-xs"
          value={note.toString()}
          readOnly
        />
        <button
          onClick={handleEdit}
          className="absolute bottom-2 right-2"
          aria-label="Edit note"
          type="button"
        >
          <img src={pencil} alt="edit" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
