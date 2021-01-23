const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const Neptune = require('../lib/neptune-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Neptune.NeptuneStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
