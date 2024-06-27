import { LABAPPTemplatePage } from './app.po';

describe('LABAPP App', function() {
  let page: LABAPPTemplatePage;

  beforeEach(() => {
    page = new LABAPPTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
