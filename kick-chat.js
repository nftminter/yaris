// Kick chat okuyucu (sadece okur, giriş gerekmez).
// Kullanım: KickChat.baglan({ kanal, chatroomId, mesaj: (kullanici, metin, renk, rozetler) => {}, durum: (bagli, yazi) => {} })
window.KickChat = (() => {
  // Kick anahtarı zaman zaman değiştiriyor: önce güncelini ister, alamazsa bilinen son anahtarı kullanır.
  const YEDEK_ANAHTAR = { key: "34bf7a0ff419a2a775b9", cluster: "us2" };

  async function anahtarAl() {
    try {
      const r = await fetch("https://web.kick.com/api/v1/realtime/connection", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: { id: "oyun-" + Math.random().toString(36).slice(2), type: "web" },
          capabilities: { accepted_providers: [{ provider: "pusher" }] } }),
      });
      const j = await r.json();
      const p = (j.data && j.data.connections || []).find(c => c.provider === "pusher");
      if (p && p.credentials && p.credentials.app_key) return { key: p.credentials.app_key, cluster: p.credentials.cluster || "us2" };
    } catch (e) {}
    return YEDEK_ANAHTAR;
  }

  async function chatroomBul(kanal, chatroomId) {
    if (chatroomId) return String(chatroomId);
    if (!kanal) return null;
    try {
      const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(kanal)}`);
      const j = await r.json();
      return j && j.chatroom && j.chatroom.id ? String(j.chatroom.id) : null;
    } catch (e) { return null; }
  }

  async function baglan({ kanal, chatroomId, mesaj, durum = () => {} }) {
    const id = await chatroomBul(kanal, chatroomId);
    if (!id) { durum(false, "Chat bulunamadı, ayarlar.js'te chatroomId'yi yaz"); return; }
    let sayac = 0;
    const etiket = "Chat bağlı" + (kanal ? ": " + kanal : "");

    async function ac() {
      const a = await anahtarAl();
      const ws = new WebSocket(`wss://ws-${a.cluster}.pusher.com/app/${a.key}?protocol=7&client=js&version=8.4.0&flash=false`);
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.event === "pusher:connection_established") {
          ws.send(JSON.stringify({ event: "pusher:subscribe", data: { auth: "", channel: `chatrooms.${id}.v2` } }));
        } else if (m.event === "pusher_internal:subscription_succeeded") {
          durum(true, etiket);
        } else if (m.event === "pusher:ping") {
          ws.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        } else if (m.event === "App\\Events\\ChatMessageEvent") {
          let d; try { d = typeof m.data === "string" ? JSON.parse(m.data) : m.data; } catch (_) { return; }
          const s = d && d.sender || {};
          sayac++;
          durum(true, `${etiket} · ${sayac} mesaj`);
          const renk = s.identity && s.identity.color; // kişinin Kick chat'teki nick rengi
          const rozetler = (s.identity && s.identity.badges || []).map(b => b && b.type).filter(Boolean); // ör. "broadcaster", "moderator"
          if (typeof d.content === "string") mesaj(s.username || String(s.id || "?"), d.content, renk, rozetler);
        }
      };
      ws.onclose = () => { durum(false, "Chat koptu, yeniden bağlanıyor…"); setTimeout(ac, 3000); };
      ws.onerror = () => { try { ws.close(); } catch (_) {} };
    }
    ac();
  }

  return { baglan };
})();
