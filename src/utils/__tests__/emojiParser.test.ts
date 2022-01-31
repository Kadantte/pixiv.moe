import { parseEmoji } from '../emojiParser';

test('should parse out with a <img />', () => {
  expect(parseEmoji('すべてのコマがかわいい(love2)')).toMatch(
    /(.*)<img(.*)src=(.*)" \/>/
  );
});
