exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumn('ingredients', {
    unite: { type: 'text' }
  });
};

exports.down = pgm => {
  pgm.dropColumn('ingredients', 'unite');
};
