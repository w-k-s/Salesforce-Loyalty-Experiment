import assert from 'assert'
import { DockerComposeEnvironment, Wait } from 'testcontainers'

const composeFilePath = ".";
const composeFile = "docker-compose.yaml";

const environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .up();

console.log("Docker compose setup complete")

describe('End-to-End Tests', function () {

    after(async () => {
        await environment.down();
    })

    describe('Get Products', function () {
        it('Product List is not empty', async function () {

            const response = await fetch("http://localhost:3000/api/v1/product")

            assert.strictEqual(200, response.status)

            const json = await response.json()

            assert.strictEqual(true, json["products"].length > 0)
        });
    });
});