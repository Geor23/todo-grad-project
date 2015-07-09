var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    var server;

    this.timeout(20000);

    testing.beforeEach(function() {
        server = helpers.setupServer();
    });
    testing.afterEach(function() {
        helpers.teardownServer(server);
    });
    testing.after(function() {
        helpers.reportCoverage();
    });

    //page load
    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite(server);
            helpers.getTitleText(server).then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "get", "/api/todo");
            helpers.navigateToSite(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });

    //create item
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getInputText(server).then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "post", "/api/todo");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another new todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });

    //delete
    testing.describe("checking delete button", function () {
        testing.it("delete item from list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another new todo item");
            helpers.deleteItem(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "delete", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.deleteItem(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 500 - Internal Server Error");
            });
        });
    });

    //delete all
    testing.describe("checking delete all button", function () {
        testing.it("delete all completed items from list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.completeItem(server);
            helpers.deleteAllItems(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "delete", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.completeItem(server);
            helpers.deleteAllItems(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 500 - Internal Server Error");
            });
        });
    });

    //complete
    testing.describe("checking complete button", function () {
        testing.it("mark item as complete", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            var value = helpers.completeItem(server);
            value.then(function(value) {
                assert.equal(value, "true");
            });
        });
        testing.it("mark item as incomplete", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            var value = helpers.incompleteItem(server);
            value.then(function(value) {
                assert.equal(value, "false");
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "put", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.completeItem(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to update item. Server returned 500 - Internal Server Error");
            });
        });
    });

    //edit function
    testing.describe("checking edit function", function () {
        testing.it("update item from list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "N");
            var text = helpers.updateItem(server);
            text.then(function(text) {
                assert.equal(text, "Nu");
            });
        });
    });
});

