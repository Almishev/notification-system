import React from 'react';
import { FaEdit } from 'react-icons/fa';

// Компонентът е запазен за съвместимост, но няма функционалност
const EditTelegramButton: React.FC = () => {
  return (
    <button
      className="btn btn-secondary btn-sm"
      disabled={true}
      aria-label="Edit Telegram message"
    >
      <FaEdit />
      <span className="ms-1">Edit</span>
    </button>
  );
};

export default EditTelegramButton;