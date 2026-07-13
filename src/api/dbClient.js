import { supabase } from '@/api/supabaseClient';

/**
 * Supabase DB wrapper providing entity CRUD operations.
 * Provides: filter(query, sort, limit), list(sort, limit), get(id),
 *           create(data), update(id, data), delete(id)
 */
function createEntity(tableName) {
  return {
    async filter(query = {}, sort, limit) {
      let q = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(query)) {
        q = q.eq(key, value);
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const col = desc ? sort.slice(1) : sort;
        q = q.order(col, { ascending: !desc });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async list(sort, limit) {
      return this.filter({}, sort, limit);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(recordData) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(recordData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

export const db = {
  entities: {
    UserProfile: createEntity('user_profiles'),
    Creature: createEntity('creatures'),
    Friend: createEntity('friends'),
  },
};