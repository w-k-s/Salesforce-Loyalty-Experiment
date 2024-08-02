import assert from 'assert'
import { DockerComposeEnvironment, Wait } from 'testcontainers'

const composeFilePath = ".";
const composeFile = "docker-compose.yaml";

const environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withWaitStrategy("keycloak", Wait.forHealthCheck())
    //.withWaitStrategy("redis", Wait.forLogMessage("Server initialized"))
    //.withWaitStrategy("mq", Wait.forLogMessage("Server startup complete;"))
    .withWaitStrategy("loyalty-api", Wait.forHealthCheck())
    .up();


describe('End-to-End Tests', function () {

    afterAll(async () => {
        await environment.down();
    })

    describe('Get Products', function () {
        it('Whatever', async function () {

            const response = await fetch("http://localhost:3000/api/v1/product")
            console.log(await response.json())

            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});