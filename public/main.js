var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var table = document.getElementById("table");

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
        title: title
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

    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";

        todos.forEach(function(todo) {

            var row = document.createElement("tr");

            var celltick = document.createElement("td");
            var tick = document.createElement("input");
            tick.setAttribute("type", "checkbox");
            celltick.appendChild(tick);

            var cellitem = document.createElement("td");
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            var idItem = todo.id;
            cellitem.appendChild(listItem);

            listItem.setAttribute("isComplete", "false");
            listItem.setAttribute("contenteditable", "false");

            var celledit = document.createElement("td");
            var edit = document.createElement("BUTTON");
            var editText = document.createTextNode("✎");
            edit.appendChild(editText);
            celledit.appendChild(edit);

            var celldel = document.createElement("td");
            var deleteButton = document.createElement("BUTTON");
            var deleteText = document.createTextNode("✗");
            deleteButton.appendChild(deleteText);
            celldel.appendChild(deleteButton);
            
            row.appendChild(celltick);
            row.appendChild(cellitem);
            row.appendChild(celledit);
            row.appendChild(celldel);

            table.appendChild(row);
            todoList.appendChild(table);

            tick.onclick = function () {
                var createRequest = new XMLHttpRequest();
                createRequest.open("PUT", "/api/todo/" + idItem + "/iscomplete" + " true");
                createRequest.onload = function() {
                    if (this.status === 200) {
                        reloadTodoList();
                    } else {
                        error.textContent = "Failed to update item. Server returned ";
                        error.textContent += this.status + " - " + this.responseText;
                    }
                };
                createRequest.send();
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

            edit.onclick = function () {
                listItem.setAttribute("contenteditable", "true");
                var updateButton = document.createElement("BUTTON");
                var updateText = document.createTextNode("✓");
                updateButton.appendChild(updateText);
                celledit.removeChild(edit);
                celledit.appendChild(updateButton);

                updateButton.onclick = function() {
                    celledit.removeChild(updateButton);
                    celledit.appendChild(edit);
                    var title = listItem.textContent;
                    var createRequest = new XMLHttpRequest();
                    createRequest.open("PUT", "/api/todo/" + idItem);
                    createRequest.setRequestHeader("Content-type", "application/json");
                    createRequest.send(JSON.stringify({
                        title: title,
                        id : idItem
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
        });
    });
}

reloadTodoList();

