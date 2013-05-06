#! /usr/bin/env node

var googleapis = require('googleapis'),
    authclient = new googleapis.OAuth2Client(),
    datasetId = 'gcd-codelab',
    compute = new googleapis.auth.Compute(),
    datastore = null,
    todoListName = null;

var usage = 'usage todo.js <todolist> <add|get|del|ls|do|undo|archive> [todo-title|todo-id]';
googleapis.discover('datastore', 'v1beta1', {
  localDiscoveryFilePath: './datastore_v1beta1.json',
}).execute(function(err, client) {
  compute.authorize(function(err, result) {
    datastore = client.datastore.datasets;
    todoListName = process.argv[2];
    var cmd = process.argv[3];
    console.assert(todoListName && cmd && commands[cmd], usage);
    commands[cmd].apply(commands, process.argv.slice(4))
  });
});

var __TODO__ = null;

var commands = {
  add: function(todoText) {
    datastore.blindwrite({
      datasetId: datasetId,
      mutation: {
        insertAutoId: [{
          key: {
            path: [{
              kind: 'TodoList',
              name: todoListName,
            },{
              kind: 'Todo',
            }]
          },
          properties: {
            title: {
              values: [{
                stringValue: todoText
              }]
            },
            completed: {
              values: [{
                booleanValue: false
              }]
            }
          }
        }]
      }
    }).withAuthClient(compute).execute(function(err, result) {
      console.assert(!err, err);
      var key = result.mutationResult.insertAutoIdKeys[0];
      console.log('%d: TODO %s', key.path[1].id, todoText);
    });    
  },
  get: function(todoId, callback) {
    datastore.lookup({
      datasetId: datasetId,
      keys: [{
        path: [{
          kind: 'TodoList',
          name: todoListName
        },{
          kind: 'Todo',
          id: todoId
        }]
      }]
    }).withAuthClient(compute).execute(function(err, result) {
      console.assert(!err, err);
      console.assert(!result.missing, 'todo %d: not found', todoId);
      var entity = result.found[0].entity;
      var text = entity.properties.title.values[0].stringValue;
      var done = entity.properties.completed.values[0].booleanValue == true;
      if (callback) {
        callback(err, todoId, text, done);
      } else {
        console.log('%d: %s %s', todoId, done && 'DONE' || 'TODO', text);
      }
    });
  },
  del: function(todoId) {
    datastore.blindwrite({
      datasetId: datasetId,
      mutation: {
        delete: [{
          path: [{
            kind: 'TodoList',
            name: todoListName,
          },{
            kind: 'Todo',
            id: todoId
          }]
        }]
      }      
    }).withAuthClient(compute).execute(function(err, result) {
      console.assert(!err, err);
      console.log('%d: DEL', todoId);
    });
  },
  edit: function(id, text, done) {
    done = done === 'true';
    datastore.blindwrite({
      datasetId: datasetId,
      mutation: {
        update: [{
          key: {
            path: [,{
              kind: 'TodoList',
              name: todoListName,
            },{
              kind: 'Todo',
              id: id
            }]
          },
          properties: {
            title: {
              values: [{
                stringValue: text
              }]
            },
            completed: {
              values: [{
                booleanValue: done
              }]
            }
          }
        }]
      }
    }).withAuthClient(compute).execute(function(err, result) {
      console.assert(!err, err);
      console.log('%d: %s %s', id, done && 'DONE' || 'TODO', text);
    });
  },
  ls: function () {
    datastore.runquery({
      datasetId: datasetId,
      query: {
        kinds: [{
          name: 'Todo',
        }],
        filter: {
          propertyFilter: {
            property: {
              name: '__key__'
            },
            operator: 'hasAncestor',
            value: {
              keyValue: {
                path: [{
                  kind: 'TodoList',
                  name: todoListName
                }]
              }
            }
          }
        }
      }   
    }).withAuthClient(compute).execute(function(err, result) {
      var entityResults = result.batch.entityResults || [];
      entityResults.forEach(function(entityResult) {
        var entity = entityResult.entity;
        var id = entity.key.path[1].id;
        var properties = entity.properties;
        var title = properties.title.values[0].stringValue;
        var done = properties.completed.values[0].booleanValue == true;
        console.log('%d: %s %s', id, done && 'DONE' || 'TODO', title);
      });
    });
  },
  archive: function() {
    datastore.__TODO__({ // fill the rpc name to start a transaction
      datasetId: datasetId
    }).withAuthClient(compute).execute(function(err, result) {
      datastore.runquery({
        datasetId: datasetId,
        readOptions: {
          transaction: __TODO__ // fill with transaction handle
        },
        query: {
          kinds: [{
            name: 'Todo',
          }],
          filter: {
            compositeFilter: {
              operator: 'and',
              filters: [{
                propertyFilter: __TODO__ // fill the ancestor filter
              },{
                propertyFilter: __TODO__ // fill the property filter
              }]
            }
          }
        }   
      }).withAuthClient(compute).execute(function(err, result) {
        var keys = __TODO__; // get the entity keys result
        datastore.commit({
          datasetId: datasetId,
          transaction: __TODO__, // set the transaction andle
          mutation: {
            __TODO__: keys // set the mutation type
          }      
        }).withAuthClient(compute).execute(function(err, result) {
          console.assert(!err, err);
          keys.forEach(function(key) {
            console.log(__TODO__); // print the delete keys
          });
        });
      });
    });
  }
};
