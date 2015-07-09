var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var table = document.getElementById("table");
var itemsLeft = document.getElementById("count-label");
var dropdown = document.getElementById("dropdown");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: "false"
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList(callback) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";

    var table = document.createElement("table");
    var totalItems = 0;
    var leftItems = 0;

    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var deleteAll = document.createElement("button");
        var delAllText = document.createTextNode("Delete Completed");
        deleteAll.appendChild(delAllText);

        todos.forEach(function(todo) {
            totalItems += 1 ;
            if (todo.isComplete === "false") {
                leftItems += 1 ;
            }
            var first = (todo.isComplete === "true" && dropdown.value !== "active");
            var second = (todo.isComplete === "false" && dropdown.value !== "completed");
            if (first || second) {
                var row = document.createElement("tr");

                var celltick = document.createElement("td");
                var tick = document.createElement("input");
                tick.setAttribute("type", "checkbox");
                tick.setAttribute("id", "tick");
                if (todo.isComplete === "true") {
                    tick.setAttribute("checked", "true");
                }
                else {
                    tick.removeAttribute("checked");
                }
                celltick.appendChild(tick);

                var cellitem = document.createElement("td");
                var listItem = document.createElement("li");
                listItem.textContent = todo.title;
                listItem.setAttribute("id", "item");
                var idItem = todo.id;
                cellitem.appendChild(listItem);

                listItem.setAttribute("contenteditable", "false");

                var celledit = document.createElement("td");
                var edit = document.createElement("BUTTON");
                var editText = document.createTextNode("✎");
                edit.appendChild(editText);
                edit.setAttribute("id", "edit");
                celledit.appendChild(edit);

                var celldel = document.createElement("td");
                var deleteButton = document.createElement("BUTTON");
                var deleteText = document.createTextNode("✗");
                deleteButton.appendChild(deleteText);
                deleteButton.setAttribute("id", "del");
                celldel.appendChild(deleteButton);

                row.appendChild(celltick);
                row.appendChild(cellitem);
                row.appendChild(celledit);
                row.appendChild(celldel);

                table.appendChild(row);
                todoList.appendChild(deleteAll);
                todoList.appendChild(dropdown);
                todoList.appendChild(table);

                tick.onclick = function () {
                    var title = listItem.textContent;
                    var complete;
                    if (todo.isComplete === "true") {
                        complete = "false";
                    }
                    else {
                        complete = "true";
                    }

                    var createRequest = new XMLHttpRequest();
                    createRequest.open("PUT", "/api/todo/" + idItem);
                    createRequest.setRequestHeader("Content-type", "application/json");
                    createRequest.send(JSON.stringify({
                        title: title,
                        id : idItem,
                        isComplete: complete
                    }));

                    createRequest.onload = function() {
                        if (this.status === 200) {
                            reloadTodoList();
                        } else {
                            error.textContent = "Failed to update item. Server returned ";
                            error.textContent += this.status + " - " + this.responseText;
                        }
                    };
                };

                deleteButton.onclick = function () {
                    var createRequest = new XMLHttpRequest();
                    createRequest.open("DELETE", "/api/todo/" + idItem);
                    createRequest.onload = function() {
                        if (this.status === 200) {
                            reloadTodoList();
                        } else {
                            error.textContent = "Failed to delete item. Server returned ";
                            error.textContent += this.status + " - " + this.responseText;
                        }
                    };
                    createRequest.send();
                };

                deleteAll.onclick = function () {

                    todos.forEach(function(todo) {
                        if (todo.isComplete === "true") {
                            var idA = todo.id;
                            var createRequest = new XMLHttpRequest();
                            createRequest.open("DELETE", "/api/todo/" + idA);
                            createRequest.onload = function() {
                                if (this.status === 200) {
                                } else {
                                    error.textContent = "Failed to delete item. Server returned ";
                                    error.textContent += this.status + " - " + this.responseText;
                                }
                            };
                            createRequest.send();
                        }
                    });
                    reloadTodoList();
                };

                edit.onclick = function () {
                    listItem.setAttribute("contenteditable", "true");
                    var updateButton = document.createElement("BUTTON");
                    var updateText = document.createTextNode("✓");
                    updateButton.appendChild(updateText);
                    updateButton.setAttribute("id", "done");
                    celledit.removeChild(edit);
                    celledit.appendChild(updateButton);

                    updateButton.onclick = function() {
                        celledit.removeChild(updateButton);
                        celledit.appendChild(edit);
                        var title = listItem.textContent;
                        var complete = todo.isComplete;
                        var createRequest = new XMLHttpRequest();
                        createRequest.open("PUT", "/api/todo/" + idItem);
                        createRequest.setRequestHeader("Content-type", "application/json");
                        createRequest.send(JSON.stringify({
                            title: title,
                            id : idItem,
                            isComplete: complete
                        }));
                        createRequest.onload = function() {
                            if (this.status === 200) {
                                reloadTodoList();
                                listItem.removeAttribute("contenteditable");
                            } else {
                                error.textContent = "Failed to update item. Server returned ";
                                error.textContent += this.status + " - " + this.responseText;
                                listItem.removeAttribute("contenteditable");
                            }
                        };
                    };
                };
            }
        });
        if (leftItems === totalItems) {
            deleteAll.setAttribute("class", "buttonall");
        }
        else {
            deleteAll.setAttribute("class", "button");
        }

        itemsLeft.textContent = "You have " + leftItems.toString();
        itemsLeft.textContent += " items left to complete out of " + totalItems.toString();
    });
}

reloadTodoList();

dropdown.onchange = function () {
    reloadTodoList();
};
