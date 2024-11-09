import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import bgImage from '../assets/bg-1.jpg';

const initialData = {
  columns: [],
};

const Board = ({ isGridLayout }) => {
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

  const handleKeyDownForList = (e) => {
    if (e.key === 'Enter') addColumn();
  };

  const handleKeyDownForCard = (e, columnId) => {
    if (e.key === 'Enter') addCard(columnId);
  };

  return (
    <div
      className="board-container"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`columns-container ${isGridLayout ? 'grid-layout' : 'row-layout'}`}>
          {data.columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{column.title}</h2>
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          className="task"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <input
                    type="text"
                    className="card-input"
                    placeholder="Add a card..."
                    value={newCardTitle[column.id] || ""}
                    onChange={(e) =>
                      setNewCardTitle({ ...newCardTitle, [column.id]: e.target.value })
                    }
                    onKeyDown={(e) => handleKeyDownForCard(e, column.id)}
                  />
                  <button onClick={() => addCard(column.id)}>Add card</button>
                </div>
              )}
            </Droppable>
          ))}
          {isAddingList ? (
            <div className="column">
              <input
                type="text"
                placeholder="Enter list name..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={handleKeyDownForList}
              />
              <button onClick={addColumn}>Add list</button>
              <button onClick={() => setIsAddingList(false)}>x</button>
            </div>
          ) : (
            <button className="add-list-button" onClick={() => setIsAddingList(true)}>
              + Add a List
            </button>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
