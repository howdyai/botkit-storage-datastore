var should = require('should'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Datastore', function() {
    var gcloudMock,
        datastoreMock,
        Storage;

    beforeEach(function() {

        keyMock = sinon.stub(),

        datastoreMock = {
            key: sinon.stub().returns(keyMock),
            get: sinon.stub(),
            save: sinon.stub(),
            createQuery: sinon.stub(),
            runQuery: sinon.stub()
        };

        gcloudMock = {
            datastore: sinon.stub().returns(datastoreMock)
        };

        Storage = proxyquire('../src/index', {
            gcloud: gcloudMock
        });

    });

    describe('init', function() {

        it('should require a config', function() {
            Storage.should.throw('projectId is required.');
        });

        it('should require projectId', function() {
            (function() {Storage({});}).should.throw('projectId is required.');
        });

        it('should initialize datastore with projectId', function() {
            var config = {projectId: 'crystalbluepersuation'};
            Storage(config);
            gcloudMock.datastore.should.be.calledWith(config);
        });
    });

    var METHODS = { teams: 'BotkitTeam', channels: 'BotkitChannel', users: 'BotkitUser' };
    Object.keys(METHODS).forEach(function(method) {

        describe('key', function() {
            var config;

            beforeEach(function() {
                config = {
                    projectId: 'right_here',
                    teamKind: METHODS[method] + 1,
                    channelKind: METHODS[method] + 1,
                    userKind: METHODS[method] + 1
                };
            });

            it('should use custom kind', function() {
                var cb = sinon.stub(),
                    data = {id: 'walterwhite'};

                Storage(config)[method].save(data, cb);
                datastoreMock.key.should.be.calledWith([METHODS[method] + 1, data.id]);
            });
        });

        describe('get', function() {
            var records,
                entity,
                config;

            beforeEach(function() {
                config = {
                    projectId: 'right_here'
                };

                entity = {
                    key: sinon.stub(),
                    data: sinon.stub()
                };
                entities = [
                    sinon.stub().returns(entity)
                ];
            });

            it('should get entity', function() {
                var cb = sinon.stub();
                datastoreMock.get.callsArgWith(1, null, entity);
                Storage(config)[method].get('walterwhite', cb);
                datastoreMock.key.should.be.calledWith([METHODS[method], 'walterwhite']);
                cb.should.be.calledWith(null, entity.data);
            });

            it('should handle non existent entity', function() {
                var cb = sinon.stub();
                datastoreMock.get.callsArgWith(1, null, null);
                Storage(config)[method].get('walterwhite', cb);
                datastoreMock.key.should.be.calledWith([METHODS[method], 'walterwhite']);
                cb.should.be.calledWith(null, null);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');
                datastoreMock.get.callsArgWith(1, err);
                Storage(config)[method].get('walterwhite', cb);
                datastoreMock.key.should.be.calledWith([METHODS[method], 'walterwhite']);
                cb.should.be.calledWith(err);
            });
        });

        describe('save', function() {
            var config;

            beforeEach(function() {
                config = {
                    projectId: 'right_here'
                };
            });

            it('should call datastore save', function() {
                var cb = sinon.stub(),
                    data = {id: 'walterwhite'},
                    updateObj = { key: keyMock, data: data};

                Storage(config)[method].save(data, cb);
                datastoreMock.key.should.be.calledWith([METHODS[method], data.id]);
                datastoreMock.save.should.be.calledWith(updateObj, cb);
            });
        });

        describe('all', function() {

            var records,
                entities,
                config;

            beforeEach(function() {
                config = {
                    projectId: 'right_here'
                };

                entities = [
                    {
                        key: 'walterwhite',
                        data: {
                            id: 'walterwhite',
                            name: 'heisenberg'
                        }
                    },
                    {
                        key: 'jessepinkman',
                        data: {
                            id: 'jessepinkman',
                            name: 'capncook'
                        }
                    }
                ];

            });

            it('should get records', function() {
                var cb = sinon.stub(),
                    result = [entities[0].data, entities[1].data];

                datastoreMock.runQuery.callsArgWith(1, null, entities);
                Storage(config)[method].all(cb);
                datastoreMock.createQuery.should.be.calledWith(METHODS[method]);
                cb.should.be.calledWith(null, result);
            });

            it('should handle no records', function() {
                var cb = sinon.stub();
                datastoreMock.runQuery.callsArgWith(1, null, undefined);
                Storage(config)[method].all(cb);
                datastoreMock.createQuery.should.be.calledWith(METHODS[method]);
                cb.should.be.calledWith(null, []);
            });

            it('should call callback on error', function() {
                var cb = sinon.stub(),
                    err = new Error('OOPS');
                datastoreMock.runQuery.callsArgWith(1, err);
                Storage(config)[method].all(cb);
                datastoreMock.createQuery.should.be.calledWith(METHODS[method]);
                cb.should.be.calledWith(err);
            });
        });
    });
});
