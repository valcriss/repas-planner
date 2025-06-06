exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('menu_recipes', {
    moment: {
      type: 'text',
      notNull: true,
      default: 'dejeuner',
      check: "moment IN ('dejeuner','diner')",
    },
  });
  pgm.dropConstraint('menu_recipes', 'unique_menu_jour');
  pgm.addConstraint('menu_recipes', 'unique_menu_jour_moment', {
    unique: ['menu_id', 'jour', 'moment'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('menu_recipes', 'unique_menu_jour_moment');
  pgm.addConstraint('menu_recipes', 'unique_menu_jour', {
    unique: ['menu_id', 'jour'],
  });
  pgm.dropColumn('menu_recipes', 'moment');
};
