import { MercadoPagoConfig, PreApproval } from 'mercadopago'

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
})

const preApprovalClient = new PreApproval(client)

export interface CreatePreApprovalParams {
  reason: string
  amount: number
  frequency: number
  frequencyType: 'months' | 'years'
  backUrl: string
  payerEmail: string
  externalReference: string
}

export async function createPreApproval(params: CreatePreApprovalParams) {
  try {
    const response = await preApprovalClient.create({
      body: {
        reason: params.reason,
        auto_recurring: {
          frequency: params.frequency,
          frequency_type: params.frequencyType,
          transaction_amount: params.amount,
          currency_id: 'ARS',
        },
        back_url: params.backUrl,
        payer_email: params.payerEmail,
        external_reference: params.externalReference,
        status: 'pending',
      },
    })

    return {
      success: true,
      preapproval_id: response.id,
      init_point: response.init_point,
    }
  } catch (error) {
    console.error('Error creating preapproval:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function cancelPreApproval(preapprovalId: string) {
  try {
    await preApprovalClient.update({
      id: preapprovalId,
      body: {
        status: 'cancelled',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error cancelling preapproval:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function getPreApproval(preapprovalId: string) {
  try {
    const response = await preApprovalClient.get({ id: preapprovalId })
    return {
      success: true,
      data: response,
    }
  } catch (error) {
    console.error('Error getting preapproval:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  // Implementar verificación de firma del webhook
  // Ver: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
  const secret = process.env.MP_WEBHOOK_SECRET!

  // TODO: Implementar verificación con HMAC
  // Por ahora retornamos true para desarrollo
  return true
}
