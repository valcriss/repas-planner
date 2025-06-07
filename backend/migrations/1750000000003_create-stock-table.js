exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('stock', {
    ingredient_id: {
      type: 'uuid',
      primaryKey: true,
      references: 'ingredients',
      onDelete: 'cascade'
    },
    quantite: { type: 'numeric', notNull: true, default: 0 }
  });
};

exports.down = pgm => {
  pgm.dropTable('stock');
};
