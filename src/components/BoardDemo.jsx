import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import bgImage from "../assets/bg-1.jpg";

const initialData = {
  columns: [
    {
      id: "column-1",
      title: "List",
      tasks: [],
    },
  ],
};

const BoardDemo = () => {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState({ type: null, id: null });
  const inputRefs = useRef({});
  const [draggingCardId, setDraggingCardId] = useState(null);

  const addColumn = () => {
    const newColumn = {
      id: `column-${data.columns.length + 1}`,
      title: "",
      tasks: [],
    };
    setData({ ...data, columns: [...data.columns, newColumn] });
    setEditing({ type: "list", id: newColumn.id });
  };

  const addCard = (columnId) => {
    const newCard = {
      id: `task-${Date.now()}`,
      content: "",
    };
    const updatedColumns = data.columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: [...col.tasks, newCard] }
        : col
    );
    setData({ ...data, columns: updatedColumns });
    setEditing({ type: "card", id: newCard.id });
  };

  const deleteColumn = (columnId) => {
    const updatedColumns = data.columns.filter((col) => col.id !== columnId);
    setData({ ...data, columns: updatedColumns });
  };

  const deleteCard = (columnId, cardId) => {
    const updatedColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        const updatedTasks = col.tasks.filter((task) => task.id !== cardId);
        return { ...col, tasks: updatedTasks };
      }
      return col;
    });
    setData({ ...data, columns: updatedColumns });
  };

  const handleRename = (id, type, value) => {
    if (type === "list") {
      const updatedColumns = data.columns.map((col) =>
        col.id === id ? { ...col, title: value } : col
      );
      setData({ ...data, columns: updatedColumns });
    } else if (type === "card") {
      const updatedColumns = data.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === id ? { ...task, content: value } : task
        ),
      }));
      setData({ ...data, columns: updatedColumns });
    }
    setEditing({ type: null, id: null });
  };

  const onDragStart = (result) => {
    setDraggingCardId(result.draggableId);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    setDraggingCardId(null);

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

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px" }}>
          {data.columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    width: "250px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    {editing.type === "list" && editing.id === column.id ? (
                      <input
                        ref={(ref) => (inputRefs.current[column.id] = ref)}
                        defaultValue={column.title}
                        onBlur={(e) => handleRename(column.id, "list", e.target.value)}
                        autoFocus
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <h3
                        onDoubleClick={() => setEditing({ type: "list", id: column.id })}
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {column.title || "Untitled"}
                      </h3>
                    )}
                    <button
                      onClick={() => deleteColumn(column.id)}
                      style={{
                        marginLeft: "auto",
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: "8px",
                            marginBottom: "8px",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "4px",
                            ...provided.draggableProps.style,
                          }}
                          onDoubleClick={() =>
                            setEditing({ type: "card", id: task.id })
                          }
                        >
                          {editing.type === "card" && editing.id === task.id ? (
                            <input
                              ref={(ref) => (inputRefs.current[task.id] = ref)}
                              defaultValue={task.content}
                              onBlur={(e) => handleRename(task.id, "card", e.target.value)}
                              autoFocus
                              style={{
                                border: "1px solid #ddd",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                width: "100%",
                              }}
                            />
                          ) : (
                            <span>{task.content || "Untitled"}</span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {draggingCardId && (
                    <div
                      style={{
                        padding: "8px",
                        backgroundColor: "#ff0000",
                        color: "#fff",
                        textAlign: "center",
                        borderRadius: "4px",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => deleteCard(column.id, draggingCardId)}
                    >
                      Drop to Delete
                    </div>
                  )}
                  <button
                    onClick={() => addCard(column.id)}
                    style={{
                      backgroundColor: "#0079bf",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      marginTop: "8px",
                    }}
                  >
                    + Add Card
                  </button>
                </div>
              )}
            </Droppable>
          ))}
          <button
            onClick={addColumn}
            style={{
              padding: "16px",
              border: "2px dashed #0079bf",
              backgroundColor: "transparent",
              color: "#0079bf",
              cursor: "pointer",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          >
            + Add List
          </button>
        </div>
      </DragDropContext>
    </div>
  );
};

export default BoardDemo;
