exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('ingredients', {
    id: 'uuid PRIMARY KEY',
    nom: { type: 'text', notNull: true },
    type: 'text',
  });

  pgm.createTable('recipes', {
    id: 'uuid PRIMARY KEY',
    nom: { type: 'text', notNull: true },
    instructions: 'text',
    ingredient_principal_id: {
      type: 'uuid',
      references: 'ingredients',
      onDelete: 'cascade',
    },
    ingredient_secondaire_id: {
      type: 'uuid',
      references: 'ingredients',
      onDelete: 'set null',
    },
  });

  pgm.createTable('recipe_ingredients', {
    id: 'uuid PRIMARY KEY',
    recipe_id: {
      type: 'uuid',
      references: 'recipes',
      onDelete: 'cascade',
    },
    ingredient_id: {
      type: 'uuid',
      references: 'ingredients',
      onDelete: 'cascade',
    },
    quantite: { type: 'text', notNull: true },
    unite: { type: 'text', notNull: true },
  });

  pgm.createTable('menus', {
    id: 'uuid PRIMARY KEY',
    semaine: { type: 'text', notNull: true, unique: true },
  });

  pgm.createTable('menu_recipes', {
    id: 'uuid PRIMARY KEY',
    menu_id: {
      type: 'uuid',
      references: 'menus',
      onDelete: 'cascade',
    },
    jour: {
      type: 'text',
      notNull: true,
      check: "jour IN ('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche')",
    },
    recipe_id: {
      type: 'uuid',
      references: 'recipes',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('menu_recipes', 'unique_menu_jour', {
    unique: ['menu_id', 'jour'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('menu_recipes');
  pgm.dropTable('menus');
  pgm.dropTable('recipe_ingredients');
  pgm.dropTable('recipes');
  pgm.dropTable('ingredients');
};