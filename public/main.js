var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

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
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            var idItem = todo.id;

            var deleteButton = document.createElement("BUTTON");
            var deleteText = document.createTextNode("Delete");
            deleteButton.appendChild(deleteText);
            listItem.appendChild(deleteButton);

            var complete = document.createElement("BUTTON");
            var completeText = document.createTextNode("Complete");
            complete.appendChild(completeText);
            listItem.appendChild(complete);

            listItem.setAttribute("isComplete", "false");


            todoList.appendChild(listItem);

            complete.onclick = function () {
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
        });
    });
}

reloadTodoList();

