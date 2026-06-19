import { REALTIME_CHANNEL } from "../config/constants.js";
import { supabaseAdmin } from "../database/supabase.js";

export class RealtimeService {
  async broadcast(event: string, payload: Record<string, unknown>) {
    const channel = supabaseAdmin.channel(REALTIME_CHANNEL);
    await channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await channel.send({
          type: "broadcast",
          event,
          payload,
        });
        await supabaseAdmin.removeChannel(channel);
      }
    });
  }
}

export const realtimeService = new RealtimeService();
