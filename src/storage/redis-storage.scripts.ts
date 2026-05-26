export const APPEND_MESSAGE_TO_GROUP_SCRIPT = `
local key = KEYS[1]

local messageJson = ARGV[1]
local messageId = tonumber(ARGV[2])
local groupKeyJson = ARGV[3]
local now = tonumber(ARGV[4])
local defaultTimeoutMs = tonumber(ARGV[5])
local ttlGraceMs = tonumber(ARGV[6])

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

local resolvedTimeoutMs = tonumber(group.timeoutMs) or defaultTimeoutMs

local existingIndex = nil
for index = 1, #group.messages do
  if tonumber(group.messages[index].message_id) == messageId then
    existingIndex = index
    break
  end
end

if existingIndex == nil then
  table.insert(group.messages, cjson.decode(messageJson))
else
  group.messages[existingIndex] = cjson.decode(messageJson)
end

table.sort(group.messages, function(left, right)
  return tonumber(left.message_id) < tonumber(right.message_id)
end)

group.updatedAt = now
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
