export const APPEND_MESSAGE_TO_GROUP_SCRIPT = `
local key = KEYS[1]

local messageJson = ARGV[1]
local messageId = tonumber(ARGV[2])
local groupKeyJson = ARGV[3]
local now = tonumber(ARGV[4])
local defaultTimeoutMs = tonumber(ARGV[5])
local timeoutOverrideRaw = ARGV[6]
local ttlGraceMs = tonumber(ARGV[7])

local raw = redis.call("GET", key)
local group

if raw then
  group = cjson.decode(raw)
else
  group = {
    groupKey = cjson.decode(groupKeyJson),
    messages = {},
    createdAt = now,
    updatedAt = now,
    timeoutMs = defaultTimeoutMs
  }
end

local resolvedTimeoutMs
if timeoutOverrideRaw ~= "" then
  resolvedTimeoutMs = tonumber(timeoutOverrideRaw)
else
  resolvedTimeoutMs = tonumber(group.timeoutMs) or defaultTimeoutMs
end

local duplicate = false
for index = 1, #group.messages do
  if tonumber(group.messages[index].message_id) == messageId then
    duplicate = true
    break
  end
end

if not duplicate then
  table.insert(group.messages, cjson.decode(messageJson))

  table.sort(group.messages, function(left, right)
    return tonumber(left.message_id) < tonumber(right.message_id)
  end)
end

if not duplicate then
  group.updatedAt = now
end
group.timeoutMs = resolvedTimeoutMs

redis.call(
  "SET",
  key,
  cjson.encode(group),
  "PX",
  resolvedTimeoutMs + ttlGraceMs
)

return cjson.encode(group)
`;
