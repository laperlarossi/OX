/**
 * Surge Panel Wake-on-LAN (Production)
 */
/**
 * Surge WOL 脚本
 * 参数格式：MAC地址 (例如: 00:11:22:33:44:55)
 */

const mac = $argument; // 从参数读取 MAC 地址
if (!mac) {
    $notification.post("WOL 失败", "未设置 MAC 地址", "请在模块配置中输入参数");
    $done();
}

function sendWOL(macAddr) {
    const hex = macAddr.replace(/[: -]/g, '');
    if (hex.length !== 12) return null;
    
    // 构造 Magic Packet: 6个 FF + 16次 MAC 地址
    let bytes = new Uint8Array(102);
    bytes.fill(0xff, 0, 6);
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 6; j++) {
            bytes[6 + i * 6 + j] = parseInt(hex.substr(j * 2, 2), 16);
        }
    }
    return bytes.buffer;
}

const payload = sendWOL(mac);
if (payload) {
    // 向局域网广播地址发送 UDP 包
    $network.udpSend("255.255.255.255", 9, payload, (error) => {
        if (error) {
            $notification.post("WOL 发送失败", "", error);
        } else {
            $notification.post("WOL 指令已发出", `目标 MAC: ${mac}`, "请检查设备是否唤醒");
        }
        $done();
    });
} else {
    $notification.post("WOL 失败", "MAC 地址格式错误", mac);
    $done();
}
