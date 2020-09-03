const assert = require('assert');
const AssertionError = require('assert').AssertionError;
const Web3 = require('web3');

const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

const { interface, bytecode } = require('../scripts/compile');

let accounts;
let usersContracts;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();
    usersContracts = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('The UsersContracts', async() => {

    it('Should deploy', () => {
        console.log(usersContracts.options.address);
        assert.ok(usersContracts.options.address);
    } )

    it('Should join a User', async () => {
        let name = "Valentin";
        let surname = "Castillo";

        await usersContracts.methods.join(name, surname)
            .send({ from: accounts[0], gas: '1000000' });
    })

    it('should retrieve a user', async () => {
        let name = "Valentin";
        let surname = "Castillo";

        await usersContracts.methods.join(name, surname)
            .send({ from: accounts[0], gas: '1000000' });

        let user = await usersContracts.methods.getUser(accounts[0]).call();

        assert.equal(name, user[0]);
        assert.equal(surname, user[1]);
    });

    it('should not allow joining an account twice', async () => {
        
        await usersContracts.methods.join("tesla", "nicola")
            .send({ from: accounts[1], gas: '1000000' });

        try {

            await usersContracts.methods.join("Ana", "Gomez")
            .send({ from: accounts[1], gas: '1000000' });
            assert.fail('same account cant join twice');
        }
        catch(e) {
            if(e instanceof AssertionError) {
                assert.fail(e.message);
            }
        }

    })

    it('should not allow retrieving a not registered user', async () => {

        try {

            await usersContracts.methods.getUser(accounts[0]).call();
            assert.fail('user should not be registered');

        }

        catch(e) {
            if(e instanceof AssertionError) {
                assert.fail(e.message);
            }
        }

    })

    it('should retrieve total registered users', async () => {

        await usersContracts.methods.join("Jose", "manrique")
            .send({ from: accounts[0], gas: '1000000' });

        await usersContracts.methods.join("Zaid", "Castillo")
            .send({ from: accounts[1], gas: '1000000' });

        
        let total = await usersContracts.methods.totalUsers().call();
        assert.equal(total, 2);

    })


})