
import { supabase } from "@/integrations/supabase/client";
import { TableName, CleanupResult } from "./types";

// Handle tables with user_id column
export async function cleanTableWithUserId(
  table: TableName, 
  userId: string
): Promise<CleanupResult> {
  console.log(`Processing table ${table} with user_id filter for user ${userId}`);
  
  try {
    // First, count how many records will be deleted
    // Use explicit type casting to avoid deep instantiation
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error(`Error counting ${table}:`, countError);
      return { table, deleted: 0 };
    }
    
    console.log(`Found ${count} records to delete in ${table}`);
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error cleaning ${table}:`, error);
      return { table, deleted: 0 };
    } else {
      console.log(`Successfully deleted ${count || 0} records from ${table}`);
      return { table, deleted: count || 0 };
    }
  } catch (err) {
    console.error(`Error cleaning ${table}:`, err);
    return { table, deleted: 0 };
  }
}

// Handle tables that need to be truncated
export async function cleanTableToTruncate(
  table: TableName
): Promise<CleanupResult> {
  console.log(`Processing table ${table} for complete truncation`);
  
  try {
    // First, count how many records exist
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error(`Error counting ${table}:`, countError);
      return { table, deleted: 0 };
    }
    
    console.log(`Found ${count} records to delete in ${table}`);
    
    if (count && count > 0) {
      // Use a different approach - delete all records one by one
      const { data: allRecords, error: fetchError } = await supabase
        .from(table)
        .select('id');
        
      if (fetchError) {
        console.error(`Error fetching records from ${table}:`, fetchError);
        return { table, deleted: 0 };
      }
      
      let deletedCount = 0;
      
      for (const record of allRecords) {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', record.id);
          
        if (!deleteError) {
          deletedCount++;
        }
      }
      
      if (deletedCount === allRecords.length) {
        console.log(`Successfully deleted ${deletedCount} records from ${table}`);
        return { table, deleted: deletedCount };
      } else {
        console.warn(`Partially deleted ${deletedCount}/${allRecords.length} records from ${table}`);
        return { table, deleted: deletedCount };
      }
    } else {
      // No records to delete
      console.log(`No records to delete in ${table}`);
      return { table, deleted: 0 };
    }
  } catch (err) {
    console.error(`Error cleaning ${table}:`, err);
    return { table, deleted: 0 };
  }
}
