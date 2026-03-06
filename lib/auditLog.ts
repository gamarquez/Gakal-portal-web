/**
 * Audit log para operaciones críticas (cumplimiento Ley 25.326)
 *
 * Requiere tabla en Supabase:
 *
 * CREATE TABLE audit_log (
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   usuario_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 *   accion      text NOT NULL,
 *   metadata    jsonb,
 *   ip          text,
 *   created_at  timestamptz DEFAULT now()
 * );
 * CREATE INDEX audit_log_usuario_id_idx ON audit_log (usuario_id);
 * CREATE INDEX audit_log_accion_idx ON audit_log (accion);
 * ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
 * -- Solo admins pueden leer el audit log
 * CREATE POLICY "admin_read_audit" ON audit_log FOR SELECT USING (false);
 */

export type AuditAccion =
  | 'plan_activado'
  | 'plan_cancelado'
  | 'plan_pausado'
  | 'suscripcion_creada'
  | 'cuenta_eliminada'
  | 'terminos_aceptados'

interface AuditLogEntry {
  usuarioId: string
  accion: AuditAccion
  metadata?: Record<string, unknown>
  ip?: string
}

/**
 * Registra una operación crítica en la tabla audit_log.
 * Nunca lanza excepción — si falla, solo logea el error.
 */
export async function writeAuditLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  entry: AuditLogEntry
): Promise<void> {
  try {
    await supabaseAdmin.from('audit_log').insert({
      usuario_id: entry.usuarioId,
      accion: entry.accion,
      metadata: entry.metadata ?? null,
      ip: entry.ip ?? null,
    })
  } catch (err) {
    console.error('Error al escribir audit_log (no crítico):', err)
  }
}
