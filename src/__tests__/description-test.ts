import { trimDescription, trimDescriptionsInConfig } from '../description'

test('trimDescription will correctly format a multiline string into a description', () => {
  expect(trimDescription(`
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquam dapibus
    diam eu convallis. Nullam tincidunt mi quis purus congue, eu commodo eros
    dapibus. Vivamus maximus ex nisi, sit amet varius dui vestibulum et. Duis in
    sem eros. Suspendisse libero ipsum, vulputate sed tortor placerat, convallis
    porta tortor. Etiam fringilla iaculis venenatis. Donec vitae mauris quis dui
    convallis ullamcorper. Nulla a velit neque. Suspendisse ac tincidunt lacus.
    Vivamus sit amet rhoncus dolor, id laoreet neque.

    Duis vulputate, dolor in dictum faucibus, velit nibh laoreet sem, a vehicula
    lorem felis a eros. Nulla tortor dolor, imperdiet vel enim eget, gravida
    dapibus ante. Cras fringilla erat at tortor cursus auctor. Donec elementum
    lacus malesuada, lobortis tellus eleifend, posuere velit. Sed neque sem,
    pharetra quis tellus eget, ornare hendrerit velit. Vivamus in urna eu libero
    vulputate dapibus. Nunc rhoncus luctus lacus, ac molestie augue finibus ut.
    Phasellus lobortis fermentum justo, id consectetur nisi ultrices nec.

    1. Nunc quis lacus semper, vehicula magna nec, aliquet magna.
    2. Suspendisse consequat nunc in vehicula elementum.
    3. Aenean et metus in enim ultricies elementum.
    4. Suspendisse laoreet turpis eu nisl tempus vestibulum.

    Pellentesque viverra efficitur magna ut malesuada. Nunc aliquet luctus
    convallis. Sed ac nulla arcu. Duis felis dui, placerat et enim quis,
    elementum dapibus quam. Mauris sem nulla, suscipit ut dolor a, tempus varius
    ligula. Ut hendrerit ultrices orci, vel rutrum purus convallis tincidunt.
    Sed varius arcu ullamcorper, ultrices turpis non, tempus est. Morbi et
    tortor ac risus lacinia malesuada sit amet ac nisl. Nulla fringilla elit nec
    tellus euismod, eu cursus ipsum ultricies. Etiam fermentum vestibulum felis,
    ac feugiat velit facilisis at.

    - Cras dapibus sem id vulputate commodo.
    - Ut viverra ipsum eget sem dignissim porttitor.
  `)).toMatchSnapshot()
})

test('trimDescriptionsInConfig will trim descriptions in nested objects', () => {
  expect(trimDescriptionsInConfig({
    a: 1,
    b: 2,
    description: ` Hello, world!    `,
    c: {
      d: {
        description: `
          Have you ever been down the water spout?
          To the very bottom of the water system?
          There you will find a little aligator
          He goes by the name of Alfred if you do he’s mine.
          I lost him.
          I threw him down the water spout
          and now I’m very lonely ‘cuz he’s gone.
          I miss him.
        `,
        e: 3,
        f: 4,
        g: {
          h: 5,
          i: 6,
        },
      },
    },
  })).toMatchSnapshot()
})
