exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('unites', {
    id: 'uuid PRIMARY KEY',
    nom: { type: 'text', notNull: true, unique: true }
  });

  pgm.addColumn('ingredients', {
    unite_id: {
      type: 'uuid',
      references: 'unites',
      onDelete: 'set null'
    }
  });

  pgm.addColumn('recipe_ingredients', {
    unite_id: {
      type: 'uuid',
      references: 'unites',
      onDelete: 'set null'
    }
  });

  pgm.sql(`
    INSERT INTO unites(id, nom)
    SELECT gen_random_uuid(), unite FROM (
      SELECT unite FROM ingredients
      UNION
      SELECT unite FROM recipe_ingredients
    ) u
    WHERE unite IS NOT NULL
    GROUP BY unite
  `);

  pgm.sql(`
    UPDATE ingredients SET unite_id = u.id
    FROM unites u
    WHERE ingredients.unite = u.nom
  `);

  pgm.sql(`
    UPDATE recipe_ingredients SET unite_id = u.id
    FROM unites u
    WHERE recipe_ingredients.unite = u.nom
  `);

  pgm.dropColumn('ingredients', 'unite');
  pgm.dropColumn('recipe_ingredients', 'unite');
};

exports.down = pgm => {
  pgm.addColumn('ingredients', { unite: { type: 'text' } });
  pgm.addColumn('recipe_ingredients', { unite: { type: 'text', notNull: true } });

  pgm.sql(`
    UPDATE ingredients i SET unite = u.nom
    FROM unites u WHERE i.unite_id = u.id
  `);

  pgm.sql(`
    UPDATE recipe_ingredients ri SET unite = u.nom
    FROM unites u WHERE ri.unite_id = u.id
  `);

  pgm.dropColumn('ingredients', 'unite_id');
  pgm.dropColumn('recipe_ingredients', 'unite_id');
  pgm.dropTable('unites');
};
