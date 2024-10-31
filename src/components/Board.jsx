import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import bgImage from '../assets/bg-1.jpg';  // Import the local image
import BoardMenu from './BoardMenu'; 

// Empty initial data with no columns/lists
const initialData = {
  columns: [],
};

const Board = () => {
  const [data, setData] = useState(initialData);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitle, setNewCardTitle] = useState({});

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = data.columns.find((col) => col.id === source.droppableId);
    const destColumn = data.columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceItems = Array.from(sourceColumn.tasks);
    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, removed);
      const updatedColumns = data.columns.map((col) =>
        col.id === source.droppableId ? { ...col, tasks: sourceItems } : col
      );
      setData({ ...data, columns: updatedColumns });
    } else {
      const destItems = Array.from(destColumn.tasks);
      destItems.splice(destination.index, 0, removed);
      const updatedColumns = data.columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceItems };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destItems };
        }
        return col;
      });
      setData({ ...data, columns: updatedColumns });
    }
  };

  // Add a new list/column
  const addColumn = () => {
    const newColumn = {
      id: `column-${data.columns.length + 1}`,
      title: newListTitle || `New List ${data.columns.length + 1}`,
      tasks: [],
    };
    setData({ ...data, columns: [...data.columns, newColumn] });
    setIsAddingList(false);
    setNewListTitle("");
  };

  // Add a new card/task to the list
  const addCard = (columnId) => {
    const newCard = {
      id: `task-${Date.now()}`,
      content: newCardTitle[columnId] || 'New Task',
    };
    const updatedColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newCard] };
      }
      return col;
    });
    setData({ ...data, columns: updatedColumns });
    setNewCardTitle({ ...newCardTitle, [columnId]: '' });
  };

  // Handle Enter key for adding lists
  const handleKeyDownForList = (e) => {
    if (e.key === 'Enter') {
      addColumn();
    }
  };

  // Handle Enter key for adding cards
  const handleKeyDownForCard = (e, columnId) => {
    if (e.key === 'Enter') {
      addCard(columnId);
    }
  };

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        height: '100vh',
        width: '100vw',
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-6 flex-wrap items-start">
          {data.columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  className="bg-gray-800 text-white p-4 rounded-lg w-72 shadow-lg flex-shrink-0"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: 'auto',
                    maxHeight: '500px',  // Restrict max height and make scrollable if too long
                    overflowY: 'auto',
                    marginBottom: '20px',  // Add some space between lists vertically
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{column.title}</h2>
                  </div>
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          className="bg-gray-700 p-4 mb-2 rounded-md shadow-md"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.content}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add Card Input */}
                  <input
                    type="text"
                    className="w-full p-2 mb-2 rounded-md text-black"
                    placeholder="Add a card..."
                    value={newCardTitle[column.id] || ""}
                    onChange={(e) =>
                      setNewCardTitle({ ...newCardTitle, [column.id]: e.target.value })
                    }
                    onKeyDown={(e) => handleKeyDownForCard(e, column.id)}
                  />
                  <button
                    className="text-sm text-white bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg"
                    onClick={() => addCard(column.id)}
                  >
                    Add card
                  </button>
                </div>
              )}
            </Droppable>
          ))}

          {/* Add List Input */}
          {isAddingList ? (
            <div className="bg-gray-800 p-4 rounded-lg w-72 shadow-lg">
              <input
                type="text"
                className="w-full p-2 mb-2 rounded-md text-black"
                placeholder="Enter list name..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={handleKeyDownForList}
              />
              <button
                className="text-sm text-white bg-blue-500 hover:bg-blue-400 px-6 py-2 rounded-lg"
                onClick={addColumn}
              >
                Add list
              </button>
              <button
                className="ml-2 text-sm text-white bg-black-500 hover:bg-slate-600 px-4 py-2 rounded-lg"
                onClick={() => setIsAddingList(false)}
              >
                x
              </button>
            </div>
          ) : (
            <button
              className="text-white border-2 border-white hover:border-gray-300 bg-slate-900 px-14 py-4 rounded-md opacity-75 hover:opacity-90 transition-all duration-200"
              onClick={() => setIsAddingList(true)}
            >
              + Add a List
            </button>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
