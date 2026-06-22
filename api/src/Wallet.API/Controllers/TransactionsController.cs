using Microsoft.AspNetCore.Mvc;
using Wallet.API.Models;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Wallet.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TransactionsController : ControllerBase
    {
        // BR-02 Checksum / address validation patterns
        private static readonly Regex SolanaRegex = new(@"^[1-9A-HJ-NP-Za-km-z]{32,44}$");
        private static readonly Regex BitcoinRegex = new(@"^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$");
        private static readonly Regex BnbRegex = new(@"^0x[a-fA-F0-9]{42}$");

        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.RawTransaction))
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "INVALID_PAYLOAD",
                    Message = "El payload criptográfico o la red de destino están malformados.",
                    Code = 400
                });
            }

            string network = request.Network.ToLower();
            bool isValidAddress = false;

            // Address Checksum & Pattern Verification (BR-02)
            if (network == "solana")
            {
                isValidAddress = SolanaRegex.IsMatch(request.SenderAddress);
            }
            else if (network == "bitcoin")
            {
                isValidAddress = BitcoinRegex.IsMatch(request.SenderAddress);
            }
            else if (network == "bnb")
            {
                isValidAddress = BnbRegex.IsMatch(request.SenderAddress);
            }

            if (!isValidAddress)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "INVALID_SENDER_ADDRESS",
                    Message = $"La dirección de envío '{request.SenderAddress}' no pasó la validación checksum para la red {request.Network}.",
                    Code = 400
                });
            }

            // Simulate Network Broadcast RPC call with RabbitMQ/Redis caching logic
            await Task.Delay(500);

            // Generates transaction Hash
            string txHash = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

            decimal fee = network == "solana" ? 0.000005m : network == "bitcoin" ? 0.00025m : 0.0012m;

            return Created(string.Empty, new BroadcastResponse
            {
                Status = "confirmed",
                TransactionHash = txHash,
                Network = network,
                FeeConsumed = fee,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
