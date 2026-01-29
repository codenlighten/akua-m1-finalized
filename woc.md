# Address

## Get Address Info

This endpoint retrieves various information for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/info
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA/info"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/381qVpM6titKUxxsN7cYcZwo5wYN8CMs3J/info"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "isvalid": true,
    "address": "16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA",
    "scriptPubKey": "76a9143d0e5368bdadddca108a0fe44739919274c726c788ac",
    "ismine": false,
    "iswatchonly": false,
    "isscript": false
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "isvalid": true,
    "address": "381qVpM6titKUxxsN7cYcZwo5wYN8CMs3J",
    "ismine": false,
    "iswatchonly": false,
    "isscript": true,
    "witness_version": 0,
    "iswitness": false,
    "witness_program": "",
    "scriptPubKey": "a914455ff45b915000add09a1d1a014ec57f6ee38dcb87"
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Address Usage Status

This endpoint serves as a usage status flag for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/used
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/174XactYXkNJkPYBpsPAuzHkwG5snmLNpC/used"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd/used"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```
true
```

{% endtab %}

{% tab title="BTC" %}

```
true
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Associated Script Hashes

There are some addresses that are associated with multiple script types. This endpoint returns a list of  script hashes associated to the given address, and their types.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/scripts
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX/scripts"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1q695z03z6kweljcvpwft7vfu6kd0guf24yaaht2/scripts"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "script": "cc0d7111befe9f24f1824c797e837c5cff2f8773901ccb9aca0372a2a6c48d34",
    "type": "pubkey"
}, {
    "script": "55f4cd3dabddd62707b374f69f66b97f5f53dac5b204bd6c09dcad39b54862d1",
    "type": "pubkeyhash"
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "script": "cf869569e05c0efe7d40dc0add9b7a52d0193fbb022070cc7b54f96e9eb1cd8f",
    "type": "witness_v0_keyhash"
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Download Statement (BSV-only)

You can download the statement (in `PDF`) for a given address.

{% code title="HTTP Request" %}

```
GET https://<network>.whatsonchain.com/statement/<address>
```

{% endcode %}

{% code title="cURL" %}

```shell
curl --location --request GET  "https://main.whatsonchain.com/statement/16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA"
```

{% endcode %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Unconfirmed Balance

This endpoint retrieves the unconfirmed balance for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unconfirmed/balance
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4/unconfirmed/balance"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6/unconfirmed/balance"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "unconfirmed": 5842074,
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6",
    "script": "71789d552fae15cc11e9a77599dfe7794884802d0b68c7a9ae6863ae9ca17dac",
    "unconfirmed": 820000,
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Unconfirmed Balance

This endpoint retrieves the unconfirmed balance for multiple addresses in a single request.

{% hint style="info" %}
Max 20 addresses per request.
{% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/unconfirmed/balance
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<addess>",
        "<addess>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/unconfirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4\", \"1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ\"] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/unconfirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6\", \"bc1qm9cvc9v7yczthvn40jf40hvt3unqd67649ytx7\"] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "unconfirmed": 5836266,
    "error": ""
}, {
    "address": "1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ",
    "script": "a6595fcfa6ac7870f3caa04633b5d60dbbb219ecdd75fc09e0f790f35bc161bd",
    "unconfirmed": 605968,
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6",
    "script": "71789d552fae15cc11e9a77599dfe7794884802d0b68c7a9ae6863ae9ca17dac",
    "unconfirmed": 820000,
    "error": ""
}, {
    "address": "bc1qm9cvc9v7yczthvn40jf40hvt3unqd67649ytx7",
    "script": "c6968cde45ab187c03f2a130858e7f88a14c158867135cb0527b3d622ebb1a7a",
    "unconfirmed": 990000,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed Balance

This endpoint retrieves the confirmed balance for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/confirmed/balance
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h/confirmed/balance"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd/confirmed/balance"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h",
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "confirmed": 181827,
    "error": "",
    "associatedScripts": [{
        "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
        "type": "pubkeyhash"
    }]
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd",
    "script": "d9d46113eb0f3759c0dabf23b87b58a4c76a0633d13add20922cc5f6ede8ddd9",
    "confirmed": 56555981260,
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Confirmed Balance

This endpoint retrieves the confirmed balance for multiple addresses in a single request.

{% hint style="info" %}
Max 20 addresses per request.
{% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/<chain>/<network>/addresses/confirmed/balance
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/confirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob\",\"1NQKomMAEPEq6jSdpRNFRjcKPvVvhUL33f\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/confirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd\",\"1DPexcq8rkPn5mXV6hPr9mpL3b5j26JG4N\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob",
    "script": "4f8f588fc9bd7304dc73a14c5d3d0813e048986465e22587e3166ce04225a756",
    "confirmed": 0,
    "error": ""
}, {
    "address": "1NQKomMAEPEq6jSdpRNFRjcKPvVvhUL33f",
    "script": "c0f739302655f27531f70206e5f47dcfc22e8bdae6bcb143d62cef90040c2f9e",
    "confirmed": 305718273076,
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd",
    "script": "d9d46113eb0f3759c0dabf23b87b58a4c76a0633d13add20922cc5f6ede8ddd9",
    "confirmed": 56555981260,
    "error": ""
}, {
    "address": "1DPexcq8rkPn5mXV6hPr9mpL3b5j26JG4N",
    "script": "8722be669964f355ced09afef9d40cefbc49fe96121c78d1405ce0857d77624e",
    "confirmed": 4382070173,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Get Unconfirmed History

This endpoint retrieves unconfirmed transactions for a given address. Returns up to 100k results in one request.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unconfirmed/history
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4/unconfirmed/history"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5/unconfirmed/history"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "result": [{
        "tx_hash": "2fde4146ae470efb337395987261b028c38e4e095b44ae3bc800c4073daf4730"
    }, {
        "tx_hash": "3570f77cc006b507b4198370b0f97adbbdf3a83c84fe3b72c1cb0579ec34ca9f"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Unconfirmed History

This endpoint retrieves  the history of unconfirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 100 items returned per request.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/unconfirmed/history
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/unconfirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4\", \"1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ\"] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/unconfirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5\", \"bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8\"] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "result": [{
        "tx_hash": "36f1ed66752c78c6d1e8e73a060002b056015ef646e01508e8802bd8cb180b2d"
    }, {
        "tx_hash": "2cd3963137335c982005fae40846c269cf022061cae0a28f7bccf6d53a0252c6"
    },
    ...
    ],
    "nextPageToken": "890dc80865d1259528b1ec07e82d02efb77f1bcd9dbd714874bf1d00a54106f5",
    "error": ""
}, {
    "address": "1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ",
    "script": "a6595fcfa6ac7870f3caa04633b5d60dbbb219ecdd75fc09e0f790f35bc161bd",
    "result": [{
        "tx_hash": "2fde4146ae470efb337395987261b028c38e4e095b44ae3bc800c4073daf4730"
    }, {
        "tx_hash": "3570f77cc006b507b4198370b0f97adbbdf3a83c84fe3b72c1cb0579ec34ca9f"
    },
    ...
    ],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}, {
    "address": "bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8",
    "script": "9ed63d5c4771581e454f3343de70e5d7967832dc3de1f8002d3d8a89dc23cec3",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed History

This endpoint retrieves confirmed transactions for a given address. Pagination is available using the provided `next-page` token.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/confirmed/history
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h/confirmed/history"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594/confirmed/history"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h",
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "result": [{
        "tx_hash": "6cc9631ef3dad77eb0141134167f20469d0b4e61405de57fe6a9ac71b943bb9f",
        "height": 797518
    }],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594",
    "script": "81e6f015f6ad293f6eb863f76bf2d3b53722974d3b040cb397030164102eb2f0",
    "result": [{
        "tx_hash": "705ecc93d7a9866b5a42b7d67802824d1f901ee782099c46dd7c1c40b2d1a8a7",
        "height": 770399
    }, {
        "tx_hash": "972185013aac0a709c426ec26c1cdf48a5baa34ae386d969e9b83ede7642b644",
        "height": 770679
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter         | Description                                        |
| ----------------- | -------------------------------------------------- |
| chain             | Desired blockchain: `bsv` or `btc`.                |
| network           | Selected network: `main` or `test`.                |
| address           | Address.                                           |
| order             | Ordering: `asc` or `desc` (default).               |
| limit (optional)  | Between `1` and `1000`; default is `100`.          |
| height (optional) | Starting block height for history; default is `0`. |
| token             | Provided `next-page` token.                        |

## Bulk Confirmed History

This endpoint retrieves  the history of confirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 20 items returned per request.
* For pagination please use the single address endpoint.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/<chain>/<network>/addresses/confirmed/history
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/confirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP\", \"1CQuHnTR1HExx9KBvwuzeERx7CZmVkFtPs\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/confirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594\", \"3PWuL3LkpvUwPYQw43h1oAuFkBc2x8EFr6\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP",
    "script": "c7713679ea48e31aec663612f5cbaeb86f9241677c0397b42d957545b47ca2fe",
    "result": [{
        "tx_hash": "6216506e2b5ef029595e1b29a20c279889873a9da4e98bcb5c619a4756ab6932",
        "height": 658093
    }, {
        "tx_hash": "df860638d1530d2ba1f25d167fa24bbef3b1387e94207ee5e11fa535413aff39",
        "height": 658093
    }],
    "error": ""
}, {
    "address": "1CQuHnTR1HExx9KBvwuzeERx7CZmVkFtPs",
    "script": "6b854b53cdea2cca701bb62d792b1dbbbf9e84f6049f93afe17734b5bc4ab08f",
    "result": [{
        "tx_hash": "817bc35394ce8ad598d7dfe37efc01f719bc1caa079d7f83ea3c51254af40277",
        "height": 666566
    }, {
        "tx_hash": "b781592ecb45b7587729e7e7b764e6e369f0259b3323470292c004410a4e0ddb",
        "height": 666566
    },
    ...
    ],
    "nextPageToken": "00000000de0000004c00000001000000400000003662383534623533636465613263636137303162623632643739326231646262626639653834663630343966393361666531373733346235626334616230386601180000000200000004000000000a2bc60400000000005f4cebffffff4b40922badad1114d77dbb7f48be9882010000003900000001190000001400000001000000080000009923897a084cde8f0101190000001400000001000000080000009923897a084cde8f010101000000ed4bed6135c0ae12f382dd544c57ef9a010000000000ffffffff000000000002",
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594",
    "script": "81e6f015f6ad293f6eb863f76bf2d3b53722974d3b040cb397030164102eb2f0",
    "result": [{
        "tx_hash": "e5f8afed665da723421226c1d8d7c9e78dffaff0215d09d38041ee951ee5bed0",
        "height": 899701
    }, {
        "tx_hash": "16b6e3a92cc549a7b392f3ce703201b7b4c14621fc1d2629f8ef29c4648a02da",
        "height": 858541
    },
    ...
    ],
    "error": ""
}, {
    "address": "3PWuL3LkpvUwPYQw43h1oAuFkBc2x8EFr6",
    "script": "b57c68f5c74e4c58cce13c93d9c8356f9c23bdcb8cd9e6de07f9e1530db6ae28",
    "result": [{
        "tx_hash": "5eb4cd7446cc5aff11f3154eac6876dd6d9fc7167e1d3d8a48078b07f761f1ad",
        "height": 848507
    }, {
        "tx_hash": "ce1a42ec6ce4ed712f86b518eeb4201af26e16918387d3d0d8ae4ad7f874bbfd",
        "height": 847976
    },
    ...
    ],
    "nextPageToken": "00000000de0000004c00000001000000400000006235376336386635633734653463353863636531336339336439633833353666396332336264636238636439653664653037663965313533306462366165323801180000000200000004000000000cf27b040000000000024bebffffff794de2f3d61b0fda5d1dc1c8398b9390010000003900000001190000001400000001000000080000002890c2ca153d9e520101190000001400000001000000080000002890c2ca153d9e52010101000000164715117e017b366640b372f29546ae010000000000ffffffff000000000002",
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Bulk History

This endpoint retrieves  the history of both confirmed and unconfirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 1000 confirmed and max 1000 unconfirmed history items returned per request.
* Page tokens provided if address contains more items than above.
* Call standard individual [unconfirmed](#get-unconfirmed-history-beta) and [confirmed](#get-confirmed-history-beta) endpoints with page token for more history if required.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/history/all
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ..
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/history/all" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP\", \"19SsDUJ29XM2VDCkZKnTXJ9Zjt3gMtnrwC\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/history/all" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5\", \"bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP",
    "script": "c7713679ea48e31aec663612f5cbaeb86f9241677c0397b42d957545b47ca2fe",
    "unconfirmed": {
        "result": [],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "6216506e2b5ef029595e1b29a20c279889873a9da4e98bcb5c619a4756ab6932",
            "height": 658093
        }, {
            "tx_hash": "df860638d1530d2ba1f25d167fa24bbef3b1387e94207ee5e11fa535413aff39",
            "height": 658093
        }],
        "error": ""
    }
}, {
    "address": "19SsDUJ29XM2VDCkZKnTXJ9Zjt3gMtnrwC",
    "script": "9ad0daaac33264199ce40596970c5ccf0096eb05b9b020002a3f1c2202841ef9",
    "unconfirmed": {
        "result": [],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "06f978c8758b45aa298e74d2951123811da06d9b22ad433fcaeceb90fb3db6cd",
            "height": 825487
        }, {
            "tx_hash": "064cad8a9ff3caad45579ee514d6a352f402ab02ed355bc9d4f9fce3eac07813",
            "height": 825488
        }],
        "error": ""
    }
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "unconfirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
        }],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308",
            "height": 905522
        }],
        "error": ""
    }
}, {
    "address": "bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8",
    "script": "9ed63d5c4771581e454f3343de70e5d7967832dc3de1f8002d3d8a89dc23cec3",
    "unconfirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
        }],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308",
            "height": 905522
        }],
        "error": ""
    }
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

# (Un)Spent Transaction Outputs

## Get Unspent UTXOs by Address

This endpoint retrieves a combined, ordered list of both confirmed and unconfirmed UTXOs for a given address.&#x20;

{% hint style="info" %}

* Returns up to 100k unconfirmed results in one request.
* Confirmed results are paginated if more than 1000 are available.
* The rest can be accessed using the provided `next-page` token.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unspent/all
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1L2F8wYxTRagCZLnsm2engg8ngGECSeuE5/unspent/all"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/1AR9sWV7ZR2C2ohGSDDKXipCfZ3RLGynHM/unspent/all"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1L2F8wYxTRagCZLnsm2engg8ngGECSeuE5",
    "script": "b3005d46af31c4b5675b73c17579b7bd366dfe10635b7b43ac111aea5226efb6",
    "result": [{
        "height": 861499,
        "tx_pos": 1,
        "tx_hash": "ab0f76f957662335f98ee430a665f924c28310ec5126c2aede56086f9233326f",
        "value": 154,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    }, {
        "height": 861925,
        "tx_pos": 99,
        "tx_hash": "54e27d08c371b67746fd3088b78eecb9acef91f497f7e776d11d605635b9dc20",
        "value": 1000,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "1AR9sWV7ZR2C2ohGSDDKXipCfZ3RLGynHM",
    "script": "7b93a4e57dfc0cfacc47f486caac7f446ae6b366f8b708260962e7ca7d39f4fb",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "891459059f872c18bd27e7cfc9a5f2a8567f6739d4535bd07281de22379dd193",
        "value": 505370,
        "isSpentInMempoolTx": false,
        "hex": "76a914674a8527a29f25613552267d0edfd181212becdc88ac",
        "status": "unconfirmed"
    },
    ...
    {
        "height": 881136,
        "tx_pos": 0,
        "tx_hash": "764da85a1e8a383d5a41e3bb7b7b9303bc99f92e258ed4bfbea3aefed4f617d7",
        "value": 600,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |
| token     | Provided `next-page` token.         |

## Get Unconfirmed UTXOs by Address

This endpoint retrieves an ordered list of unconfirmed UTXOs for a given address.

{% hint style="info" %}
Returns up to 100k results in one request.
{% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unconfirmed/unspent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/12drYTV2c9nZMrxep9ewpWPdLrV5bNcWF2/unconfirmed/unspent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1qcvltc5pzeq7dt52x0q0yjhlzlmvufusd0vm27a/unconfirmed/unspent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "12drYTV2c9nZMrxep9ewpWPdLrV5bNcWF2",
    "script": "2d4ec8100056a819943df89efb3ac6a37a44bdf46a307dc390c31f6db31a092f",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "bdcfb99b692a3418f79471ca970a201149d19ba97d0ca5c0b89949bdb627a1c9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "575e01c3ef02809308c835308a643199e56c3eb80816a28c1db51f31968c413d",
        "value": 17000,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "bc1qcvltc5pzeq7dt52x0q0yjhlzlmvufusd0vm27a",
    "script": "d429f1c1970baaa6e8e1367b1e8689aafaefed972c0351a2223ceba047f22fdd",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "a3c6d8dd8c7c777527e9e45803cf2e9efda9d09bcde7830368e1719b292938fd",
        "value": 1382600,
        "isSpentInMempoolTx": false,
        "hex": "0014c33ebc5022c83cd5d146781e495fe2fed9c4f20d"
    }],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Unconfirmed UTXOs by Address

This endpoint retrieves an ordered list of unconfirmed UTXOs for a given set of addresses

{% hint style="info" %}

* Max 20 addresses per request.
* Returns up to 100 items in one request.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/addresses/unconfirmed/unspent
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
    	"<address>",
    	"<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/unconfirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"12drYTV2c9nZMrxep9ewpWPdLrV5bNcWF2\",\"1uEVHTbkzhz6pFfMQEYoimE2bQZNbhRC8\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/unconfirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"bc1qcvltc5pzeq7dt52x0q0yjhlzlmvufusd0vm27a\",\"bc1qvqny32utwemf32rlvk0tghjn6h40wwtn7feq7p\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "12drYTV2c9nZMrxep9ewpWPdLrV5bNcWF2",
    "script": "2d4ec8100056a819943df89efb3ac6a37a44bdf46a307dc390c31f6db31a092f",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "bdcfb99b692a3418f79471ca970a201149d19ba97d0ca5c0b89949bdb627a1c9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "575e01c3ef02809308c835308a643199e56c3eb80816a28c1db51f31968c413d",
        "value": 17000,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    },
    ...
    ],
    "error": ""
}, {
    "address": "1uEVHTbkzhz6pFfMQEYoimE2bQZNbhRC8",
    "script": "b1654010d45195751fd392c13819834726edc87d6508f94cff4e41f643db2e49",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "ee568800fe3c442fc458e2a1471ac0c697d1b6c31d4185e016a58700514c82cc",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "186e0bd354cc0ba6a00a70529b60940a553eef4e468d109c7c8614d04d260ee9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    },
    ...
    ],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "bc1qcvltc5pzeq7dt52x0q0yjhlzlmvufusd0vm27a",
    "script": "d429f1c1970baaa6e8e1367b1e8689aafaefed972c0351a2223ceba047f22fdd",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "a3c6d8dd8c7c777527e9e45803cf2e9efda9d09bcde7830368e1719b292938fd",
        "value": 1382600,
        "isSpentInMempoolTx": false,
        "hex": "0014c33ebc5022c83cd5d146781e495fe2fed9c4f20d"
    }],
    "error": ""
}, {
    "address": "bc1qvqny32utwemf32rlvk0tghjn6h40wwtn7feq7p",
    "script": "d939bd1751111e7cd8fb0d2a6945941e947a4bdcb396acd5635df8292fc3a375",
    "result": [{
        "tx_pos": 1,
        "tx_hash": "a3c6d8dd8c7c777527e9e45803cf2e9efda9d09bcde7830368e1719b292938fd",
        "value": 2010800,
        "isSpentInMempoolTx": false,
        "hex": "0014602648ab8b767698a87f659eb45e53d5eaf73973"
    }],
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed UTXOs by Address

This endpoint retrieves an ordered list of confirmed UTXOs for a given address.

{% hint style="info" %}

* `isSpentInMempoolTx` flag enables filtering of spent unconfirmed transactions from this set.
* Pagination is available using the provided `next-page` token.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/confirmed/unspent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h/confirmed/unspent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/1AR9sWV7ZR2C2ohGSDDKXipCfZ3RLGynHM/confirmed/unspent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h",
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "result": [{
        "height": 797518,
        "tx_pos": 0,
        "tx_hash": "6cc9631ef3dad77eb0141134167f20469d0b4e61405de57fe6a9ac71b943bb9f",
        "value": 181827,
        "isSpentInMempoolTx": false
    }],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "1AR9sWV7ZR2C2ohGSDDKXipCfZ3RLGynHM",
    "script": "7b93a4e57dfc0cfacc47f486caac7f446ae6b366f8b708260962e7ca7d39f4fb",
    "result": [{
        "height": 881136,
        "tx_pos": 0,
        "tx_hash": "764da85a1e8a383d5a41e3bb7b7b9303bc99f92e258ed4bfbea3aefed4f617d7",
        "value": 600,
        "isSpentInMempoolTx": false
    }, {
        "height": 886287,
        "tx_pos": 1,
        "tx_hash": "12b8cf9dfaed801d448b6a36d4fc534245560108cc0ae067a13073dab7238a12",
        "value": 601,
        "isSpentInMempoolTx": false
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

<table><thead><tr><th width="349">Parameter</th><th>Description</th></tr></thead><tbody><tr><td>chain</td><td>Desired blockchain: <code>bsv</code> or <code>btc</code>.</td></tr><tr><td>network</td><td>Selected network: <code>main</code> or <code>test</code>.</td></tr><tr><td>address</td><td>Address.</td></tr><tr><td>limit</td><td>Between <code>1</code> and <code>10000</code> (default).</td></tr><tr><td>token</td><td>Provided <code>next-page</code> token.</td></tr></tbody></table>

## Bulk Confirmed UTXOs by Address

This endpoint retrieves an ordered list of confirmed UTXOs for a given set of addresses

{% hint style="info" %}

* Max 20 addresses per request.
* Returns up to 20 items in one request.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/addresses/confirmed/unspent
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
    	"<address>",
    	"<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/confirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP\",\"1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/confirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd\",\"382UwmXW5WgrS7kmG3XQLHV1ivVjTJzS94\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP",
    "result": [{
        "height": 657540,
        "tx_pos": 1,
        "tx_hash": "d75485c2329a533fd06b5f55a3f21644741c0258f2974d5d989e946a0bb4357f",
        "value": 25000000
    },{
        "height": 657542,
        "tx_pos": 1,
        "tx_hash": "55a656d50327ec3237fa6e821ab62294695cfd508d631dc9b04dc3a395cf0a37",
        "value": 25000000
    }],
    "error": ""
},{
    "address": "1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob",
    "result": [{
        "height": 658133,
        "tx_pos": 1,
        "tx_hash": "7ae43aac97396bc99616d8273c6cd9b57f017d6d49aca742fbc8c214fee49fa7",
        "value": 25000000
    },{
        "height": 658134,
        "tx_pos": 1,
        "tx_hash": "5b25a56bbb959f9cf4b3e48dbbe412bf5cc85e655d27f87c3bfb07aa6aa01518",
        "value": 25000000
    }],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd",
    "script": "d9d46113eb0f3759c0dabf23b87b58a4c76a0633d13add20922cc5f6ede8ddd9",
    "result": [{
        "height": 891917,
        "tx_pos": 0,
        "tx_hash": "a367face4189b870b340ba391ef336e756305f65f2e060ae8486d100ab89f33a",
        "value": 546,
        "isSpentInMempoolTx": false
    }, {
        "height": 891978,
        "tx_pos": 0,
        "tx_hash": "608ffca4e1a21fc767f802e37f2c673db7b9ab6076cbbffa82bd090af56eebbf",
        "value": 546,
        "isSpentInMempoolTx": false
    },
    ...
    ],
    "nextPageToken": "000000002f0100004c000000010000004000000064396434363131336562306633373539633064616266323362383762353861346337366130363333643133616464323039323263633566366564653864646439016900000005000000010000000004000000000d9c0d040000000000043a40000000613336376661636534313839623837306233343062613339316566333336653735363330356636356632653036306165383438366431303061623839663333610400000000000000ebffffff8a448b12ab55abccc87bef8c6e82e38301000000390000000119000000140000000100000008000000b3eee3a4f216cea2010119000000140000000100000008000000b3eee3a4f216cea2010101000000164715117e017b366640b372f29546ae010000000000ffffffff000000000002",
    "error": ""
}, {
    "address": "382UwmXW5WgrS7kmG3XQLHV1ivVjTJzS94",
    "script": "f55f33505fe16e01f0e79fde7259d71191c901a6b40833d5297251ce64b5705b",
    "result": null,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Get Unspent UTXOs by Script

This endpoint retrieves a combined, ordered list of both confirmed and unconfirmed UTXOs for a given script.

{% hint style="info" %}

* Returns up to 100k unconfirmed results in one request.
* Confirmed results are paginated if more than 1000 are available.
* The rest can be accessed using the provided `next-page` token.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/script/<scriptHash>/unspent/all
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/script/b3005d46af31c4b5675b73c17579b7bd366dfe10635b7b43ac111aea5226efb6/unspent/all"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/script/d429f1c1970baaa6e8e1367b1e8689aafaefed972c0351a2223ceba047f22fdd/unspent/all"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "script": "b3005d46af31c4b5675b73c17579b7bd366dfe10635b7b43ac111aea5226efb6",
    "result": [{
        "height": 861499,
        "tx_pos": 1,
        "tx_hash": "ab0f76f957662335f98ee430a665f924c28310ec5126c2aede56086f9233326f",
        "value": 154,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    }, {
        "height": 861925,
        "tx_pos": 99,
        "tx_hash": "54e27d08c371b67746fd3088b78eecb9acef91f497f7e776d11d605635b9dc20",
        "value": 1000,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "script": "d429f1c1970baaa6e8e1367b1e8689aafaefed972c0351a2223ceba047f22fdd",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "a3c6d8dd8c7c777527e9e45803cf2e9efda9d09bcde7830368e1719b292938fd",
        "value": 1382600,
        "isSpentInMempoolTx": false,
        "hex": "0014c33ebc5022c83cd5d146781e495fe2fed9c4f20d",
        "status": "unconfirmed"
    }, {
        "height": 904501,
        "tx_pos": 1,
        "tx_hash": "dc625944cd7fc5761c93b337063fff0ed2c127c79b092159a2ede4491e5961db",
        "value": 142777600,
        "isSpentInMempoolTx": false,
        "status": "confirmed"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter  | Description                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| network    | Selected network: `main` or `test`.                                                                                       |
| scriptHash | Script hash: `Sha256` hash of the binary bytes of the locking script (`ScriptPubKey`), expressed as a hexadecimal string. |

## Get Unconfirmed UTXOs by Script

This endpoint retrieves the ordered list of unconfirmed UTXOs for a given script.

{% hint style="info" %}
Returns up to 100k results in one request.
{% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/script/<scriptHash>/unconfirmed/unspent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/script/b1654010d45195751fd392c13819834726edc87d6508f94cff4e41f643db2e49/unconfirmed/unspent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/script/0954dff09a1f76f413f53ff8f92f58f0b36b3abad8ef9dcd98ba55686ea9dad8/unconfirmed/unspent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "script": "b1654010d45195751fd392c13819834726edc87d6508f94cff4e41f643db2e49",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "ee568800fe3c442fc458e2a1471ac0c697d1b6c31d4185e016a58700514c82cc",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "186e0bd354cc0ba6a00a70529b60940a553eef4e468d109c7c8614d04d260ee9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "script": "0954dff09a1f76f413f53ff8f92f58f0b36b3abad8ef9dcd98ba55686ea9dad8",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "71e1ffb4b435000ad3fce89ed660a1f618787381e10b0b11426def778a9ab6de",
        "value": 47600669,
        "isSpentInMempoolTx": false,
        "hex": "a914424f29a8a84fa867814ff9ded43379c9dc9a681487"
    }, {
        "tx_pos": 0,
        "tx_hash": "bf7f0cb602bdecd290e8a93924e34f915d4e9c9e3b3cec35d0f5c26950066ba0",
        "value": 30202537,
        "isSpentInMempoolTx": false,
        "hex": "a914424f29a8a84fa867814ff9ded43379c9dc9a681487"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter  | Description                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| network    | Selected network: `main` or `test`.                                                                                       |
| scriptHash | Script hash: `Sha256` hash of the binary bytes of the locking script (`ScriptPubKey`), expressed as a hexadecimal string. |

## Bulk Unconfirmed UTXOs by Script

This endpoint retrieves an ordered list of unconfirmed UTXOs for a given set of script hashes.

{% hint style="info" %}

* Max 20 scripthashes per request.
* Returns up to 20 items in one request.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/scripts/unconfirmed/unspent
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "scripts": [
        "<script>",
        "<script>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/scripts/unconfirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"scripts\" : [\"b1654010d45195751fd392c13819834726edc87d6508f94cff4e41f643db2e49\",\"2d4ec8100056a819943df89efb3ac6a37a44bdf46a307dc390c31f6db31a092f\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/scripts/unconfirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"scripts\" : [\"0954dff09a1f76f413f53ff8f92f58f0b36b3abad8ef9dcd98ba55686ea9dad8\",\"721ab98a12c78293b02278d19c45bb99c83a5289907f2854e3271c1aaf93b0f3\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "script": "b1654010d45195751fd392c13819834726edc87d6508f94cff4e41f643db2e49",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "ee568800fe3c442fc458e2a1471ac0c697d1b6c31d4185e016a58700514c82cc",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "186e0bd354cc0ba6a00a70529b60940a553eef4e468d109c7c8614d04d260ee9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91409e0e39164714f25254ac278fc939933b1fe21f888ac"
    },
    ...
    ],
    "error": ""
}, {
    "script": "2d4ec8100056a819943df89efb3ac6a37a44bdf46a307dc390c31f6db31a092f",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "bdcfb99b692a3418f79471ca970a201149d19ba97d0ca5c0b89949bdb627a1c9",
        "value": 85,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    }, {
        "tx_pos": 0,
        "tx_hash": "575e01c3ef02809308c835308a643199e56c3eb80816a28c1db51f31968c413d",
        "value": 17000,
        "isSpentInMempoolTx": false,
        "hex": "76a91411f074cf02b2c8070c424384493cb5c8548ae20788ac"
    },
    ...
    ],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "script": "0954dff09a1f76f413f53ff8f92f58f0b36b3abad8ef9dcd98ba55686ea9dad8",
    "result": [{
        "tx_pos": 0,
        "tx_hash": "64362c322487a25f9f7cab377ab27490256347db06d96da581cc10e9956119ca",
        "value": 5752365,
        "isSpentInMempoolTx": false,
        "hex": "a914424f29a8a84fa867814ff9ded43379c9dc9a681487"
    }, {
        "tx_pos": 1,
        "tx_hash": "a12d907e49794e6c47fefde137bac977065337b8989917bf998ce58892479fc6",
        "value": 46203,
        "isSpentInMempoolTx": false,
        "hex": "a914424f29a8a84fa867814ff9ded43379c9dc9a681487"
    },
    ...
    ],
    "error": ""
}, {
    "script": "721ab98a12c78293b02278d19c45bb99c83a5289907f2854e3271c1aaf93b0f3",
    "result": null,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed UTXOs by Script

This endpoint retrieves the ordered list of confirmed UTXOs for a given script.

{% hint style="info" %}

* `isSpentInMempoolTx` flag enables filtering of spent unconfirmed transactions from this set.
* Pagination is available using the provided `next-page` token.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/script/<scriptHash>/confirmed/unspent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/script/0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832/confirmed/unspent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/script/aebd9e3018dbb5eed9220f275d3098dad2448fecd1c4c253d8c75a780bb08ce3/confirmed/unspent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "result": [{
        "height": 797518,
        "tx_pos": 0,
        "tx_hash": "6cc9631ef3dad77eb0141134167f20469d0b4e61405de57fe6a9ac71b943bb9f",
        "value": 181827,
        "isSpentInMempoolTx": false
    }],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "script": "aebd9e3018dbb5eed9220f275d3098dad2448fecd1c4c253d8c75a780bb08ce3",
    "result": [{
        "height": 904231,
        "tx_pos": 1,
        "tx_hash": "97b654a463364bf0fa0035dcb315abcdcf6c39ab4e522b3488060ba7098f55f0",
        "value": 2388665,
        "isSpentInMempoolTx": false
    }, {
        "height": 904268,
        "tx_pos": 0,
        "tx_hash": "fe18d4743815e5c152824063d08040d1df9bde0fcbe964288c3035cc16f63f0e",
        "value": 6389114,
        "isSpentInMempoolTx": false
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter  | Description                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| chain      | Desired blockchain: `bsv` or `btc`.                                                                                       |
| network    | Selected network: `main` or `test`.                                                                                       |
| scriptHash | Script hash: `Sha256` hash of the binary bytes of the locking script (`ScriptPubKey`), expressed as a hexadecimal string. |
| limit      | Between `1` and `10000` (default).                                                                                        |
| token      | Provided `next-page` token.                                                                                               |

## Bulk Confirmed UTXOs by Script

This endpoint retrieves an ordered list of confirmed UTXOs for a given set of script hashes.

{% hint style="info" %}

* Max 20 script hashes per request.
* Returns up to 20 items in one request.
  {% endhint %}

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/scripts/confirmed/unspent
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "scripts": [
        "<script>",
        "<script>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/scripts/confirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"scripts\" : [\"f814a7c3a40164aacc440871e8b7b14eb6a45f0ca7dcbeaea709edc83274c5e7\",\"995ea8d0f752f41cdd99bb9d54cb004709e04c7dc4088bcbbbb9ea5c390a43c3\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/scripts/confirmed/unspent" \
  --header "Content-Type: application/json" \
  --data "{\"scripts\" : [\"aebd9e3018dbb5eed9220f275d3098dad2448fecd1c4c253d8c75a780bb08ce3\",\"843bf6ea60946a9ff5cf1d526878177317b88dcba83db33a4036ae9ca9f1f0cf\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "script": "f814a7c3a40164aacc440871e8b7b14eb6a45f0ca7dcbeaea709edc83274c5e7",
    "result": [{
        "height": 620539,
        "tx_pos": 0,
        "tx_hash": "4ec3b63d764558303eda720e8e51f69bbcfe81376075657313fb587306f8a9b0",
        "value": 450000,
        "isSpentInMempoolTx": false
    }],
    "error": ""
}, {
    "script": "995ea8d0f752f41cdd99bb9d54cb004709e04c7dc4088bcbbbb9ea5c390a43c3",
    "result": [],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "script": "aebd9e3018dbb5eed9220f275d3098dad2448fecd1c4c253d8c75a780bb08ce3",
    "result": [{
        "height": 904231,
        "tx_pos": 1,
        "tx_hash": "97b654a463364bf0fa0035dcb315abcdcf6c39ab4e522b3488060ba7098f55f0",
        "value": 2388665,
        "isSpentInMempoolTx": false
    }, {
        "height": 904268,
        "tx_pos": 0,
        "tx_hash": "fe18d4743815e5c152824063d08040d1df9bde0fcbe964288c3035cc16f63f0e",
        "value": 6389114,
        "isSpentInMempoolTx": false
    }, 
    ...
    ],
    "error": ""
}, {
    "script": "843bf6ea60946a9ff5cf1d526878177317b88dcba83db33a4036ae9ca9f1f0cf",
    "result": [{
        "height": 891509,
        "tx_pos": 0,
        "tx_hash": "d38d3c310658daf5bfa5ab65e18509dd1f532de99c12d51373f39abf4c66feb3",
        "value": 1785,
        "isSpentInMempoolTx": false
    }],
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Get Unconfirmed Spent Tx Output

This endpoint retrieves where the specified unconfirmed transaction output was spent.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/tx/<txid>/<voutIndex>/unconfirmed/spent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/tx/c6647a562ac6a3cce0f46c2fb2b417cbd5daf1258f2a96d7556e6b9304f2889a/0/unconfirmed/spent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/tx/f656777a198cc497da4ed2f159f56868508fce40b3d32edeca770aba79afd52a/1/unconfirmed/spent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "txid": "6fe244e16ea34b30ec2888c41d7e05a36fc1838de6a612008adf71c99678c0c1",
    "vin": 0,
    "status": "unconfirmed"
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "txid": "246523804e2fd48cf27314897d3abe8d2737376549c21b162dec64aa741265df",
    "vin": 0,
    "status": "unconfirmed"
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| txid      | Transaction ID.                     |
| voutIndex | Output index.                       |

## Get Confirmed Spent Tx Output

This endpoint retrieves where the specified confirmed transaction output was spent.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/tx/<txid>/<voutIndex>/confirmed/spent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/tx/17d533c6a215223a62eef389707f77bef1601a18e4e994805a7846c3f3d50870/2/confirmed/spent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/tx/27e9a5d180186ccd0ff343a11e6595cec753ed9dcc7e62e977112bf8bf426436/0/confirmed/spent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "txid": "87645a7c4a9a5a9b9cd1468db19cdba44129c35cc487fc57c4d8843141ad2551",
    "vin": 2,
    "status": "confirmed"
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "txid": "ad7e7be78c298efdc375c3500d17199b9051825afcc91a6974c615a81f9a0afd",
    "vin": 0,
    "status": "confirmed"
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| txid      | Transaction ID.                     |
| voutIndex | Output index.                       |

## Get Spent Transaction Output

This endpoint retrieves where the specified transaction output was spent, checking both confirmed and unconfirmed in a single call.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/tx/<txid>/<voutIndex>/spent
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/tx/17d533c6a215223a62eef389707f77bef1601a18e4e994805a7846c3f3d50870/2/spent"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/tx/27e9a5d180186ccd0ff343a11e6595cec753ed9dcc7e62e977112bf8bf426436/0/spent"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "txid": "87645a7c4a9a5a9b9cd1468db19cdba44129c35cc487fc57c4d8843141ad2551",
    "vin": 2,
    "status": "confirmed"
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "txid": "ad7e7be78c298efdc375c3500d17199b9051825afcc91a6974c615a81f9a0afd",
    "vin": 0,
    "status": "confirmed"
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| txid      | Transaction ID.                     |
| voutIndex | Output index.                       |

**Errors**

| Error             | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `400 Bad Request` | If UTXO is unknown.                                                         |
| `404 Not Found`   | If UTXO is known but spent details are not found, i.e., it's still unspent. |

## Bulk Spent Transaction Outputs

This endpoint retrieves where the specified transaction outputs were spent, checking both confirmed and unconfirmed in a single call.

{% hint style="info" %}
Max 20 transaction outputs per request.
{% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/utxos/spent
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "utxos": [
        {
        "txid": "<txid>",
        "vout": <vout>
        },
        {
        "txid": "<txid>",
        "vout": <vout>
        },
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/utxos/spent" \
  --header "Content-Type: application/json" \
  --data "{\"utxos\" :[{ \"txid\" :\"87645a7c4a9a5a9b9cd1468db19cdba44129c35cc487fc57c4d8843141ad2551\", \"vout\" : 2}, {\"txid\" :\"c6647a562ac6a3cce0f46c2fb2b417cbd5daf1258f2a96d7556e6b9304f2889a\", \"vout\" : 0}]}"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/utxos/spent" \
  --header "Content-Type: application/json" \
  --data "{\"utxos\" :[{ \"txid\" :\"27e9a5d180186ccd0ff343a11e6595cec753ed9dcc7e62e977112bf8bf426436\", \"vout\" : 0}, {\"txid\" :\"f656777a198cc497da4ed2f159f56868508fce40b3d32edeca770aba79afd52a\", \"vout\" : 1}]}"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "utxo": {
        "txid": "87645a7c4a9a5a9b9cd1468db19cdba44129c35cc487fc57c4d8843141ad2551",
        "vout": 2
    },
    "spentIn": {
        "txid": "88d8ce011179fac0dc466a1c5fcb734a91b076d15354aee4f7186ea3f5921533",
        "vin": 93,
        "status": "confirmed"
    },
    "error": ""
}, {
    "utxo": {
        "txid": "c6647a562ac6a3cce0f46c2fb2b417cbd5daf1258f2a96d7556e6b9304f2889a",
        "vout": 0
    },
    "spentIn": {
        "txid": "1574a7952dc989481a17a7c4f1db3c6ae7bd112383ff946d913cdfe161f039dd",
        "vin": 19,
        "status": "confirmed"
    },
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "utxo": {
        "txid": "27e9a5d180186ccd0ff343a11e6595cec753ed9dcc7e62e977112bf8bf426436",
        "vout": 0
    },
    "spentIn": {
        "txid": "ad7e7be78c298efdc375c3500d17199b9051825afcc91a6974c615a81f9a0afd",
        "vin": 0,
        "status": "confirmed"
    },
    "error": ""
}, {
    "utxo": {
        "txid": "f656777a198cc497da4ed2f159f56868508fce40b3d32edeca770aba79afd52a",
        "vout": 1
    },
    "spentIn": {
        "txid": "246523804e2fd48cf27314897d3abe8d2737376549c21b162dec64aa741265df",
        "vin": 0,
        "status": "confirmed"
    },
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

**Errors**

| Parameter         | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `400 Bad Request` | If UTXO is unknown.                                                         |
| `404 Not Found`   | If UTXO is known but spent details are not found, i.e., it's still unspent. |

## ElectrumX Wrapper for ElectrumSV (Beta)

We've created a wrapper for our UTXO service that acts exactly like an ElectrumX server that you can plug into the [ElectrumSV](https://electrumsv.io/) wallet (Network - Server).

Use any of these URLs to try it out and let us know what you think in the [Telegram channel](https://t.co/2WWqPUGUoK):

* URL1: <http://electrumx-adapter-1.whatsonchain.com/>
* URL2: <http://electrumx-adapter-2.whatsonchain.com/>

Use either the `50001` ,`50002` , or `50003` port.
# Address

## Get Address Info

This endpoint retrieves various information for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/info
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA/info"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/381qVpM6titKUxxsN7cYcZwo5wYN8CMs3J/info"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "isvalid": true,
    "address": "16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA",
    "scriptPubKey": "76a9143d0e5368bdadddca108a0fe44739919274c726c788ac",
    "ismine": false,
    "iswatchonly": false,
    "isscript": false
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "isvalid": true,
    "address": "381qVpM6titKUxxsN7cYcZwo5wYN8CMs3J",
    "ismine": false,
    "iswatchonly": false,
    "isscript": true,
    "witness_version": 0,
    "iswitness": false,
    "witness_program": "",
    "scriptPubKey": "a914455ff45b915000add09a1d1a014ec57f6ee38dcb87"
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Address Usage Status

This endpoint serves as a usage status flag for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/used
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/174XactYXkNJkPYBpsPAuzHkwG5snmLNpC/used"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd/used"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```
true
```

{% endtab %}

{% tab title="BTC" %}

```
true
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Associated Script Hashes

There are some addresses that are associated with multiple script types. This endpoint returns a list of  script hashes associated to the given address, and their types.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/scripts
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX/scripts"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1q695z03z6kweljcvpwft7vfu6kd0guf24yaaht2/scripts"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "script": "cc0d7111befe9f24f1824c797e837c5cff2f8773901ccb9aca0372a2a6c48d34",
    "type": "pubkey"
}, {
    "script": "55f4cd3dabddd62707b374f69f66b97f5f53dac5b204bd6c09dcad39b54862d1",
    "type": "pubkeyhash"
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "script": "cf869569e05c0efe7d40dc0add9b7a52d0193fbb022070cc7b54f96e9eb1cd8f",
    "type": "witness_v0_keyhash"
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Download Statement (BSV-only)

You can download the statement (in `PDF`) for a given address.

{% code title="HTTP Request" %}

```
GET https://<network>.whatsonchain.com/statement/<address>
```

{% endcode %}

{% code title="cURL" %}

```shell
curl --location --request GET  "https://main.whatsonchain.com/statement/16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA"
```

{% endcode %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Get Unconfirmed Balance

This endpoint retrieves the unconfirmed balance for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unconfirmed/balance
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4/unconfirmed/balance"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6/unconfirmed/balance"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "unconfirmed": 5842074,
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6",
    "script": "71789d552fae15cc11e9a77599dfe7794884802d0b68c7a9ae6863ae9ca17dac",
    "unconfirmed": 820000,
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Unconfirmed Balance

This endpoint retrieves the unconfirmed balance for multiple addresses in a single request.

{% hint style="info" %}
Max 20 addresses per request.
{% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/unconfirmed/balance
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<addess>",
        "<addess>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/unconfirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4\", \"1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ\"] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/unconfirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6\", \"bc1qm9cvc9v7yczthvn40jf40hvt3unqd67649ytx7\"] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "unconfirmed": 5836266,
    "error": ""
}, {
    "address": "1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ",
    "script": "a6595fcfa6ac7870f3caa04633b5d60dbbb219ecdd75fc09e0f790f35bc161bd",
    "unconfirmed": 605968,
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "bc1qju8ttjzcucwvums0cxy3gsp0vt52sgyd2glyv6",
    "script": "71789d552fae15cc11e9a77599dfe7794884802d0b68c7a9ae6863ae9ca17dac",
    "unconfirmed": 820000,
    "error": ""
}, {
    "address": "bc1qm9cvc9v7yczthvn40jf40hvt3unqd67649ytx7",
    "script": "c6968cde45ab187c03f2a130858e7f88a14c158867135cb0527b3d622ebb1a7a",
    "unconfirmed": 990000,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed Balance

This endpoint retrieves the confirmed balance for a given address.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/confirmed/balance
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h/confirmed/balance"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd/confirmed/balance"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h",
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "confirmed": 181827,
    "error": "",
    "associatedScripts": [{
        "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
        "type": "pubkeyhash"
    }]
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd",
    "script": "d9d46113eb0f3759c0dabf23b87b58a4c76a0633d13add20922cc5f6ede8ddd9",
    "confirmed": 56555981260,
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Confirmed Balance

This endpoint retrieves the confirmed balance for multiple addresses in a single request.

{% hint style="info" %}
Max 20 addresses per request.
{% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/<chain>/<network>/addresses/confirmed/balance
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/confirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob\",\"1NQKomMAEPEq6jSdpRNFRjcKPvVvhUL33f\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/confirmed/balance" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [\"3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd\",\"1DPexcq8rkPn5mXV6hPr9mpL3b5j26JG4N\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1KGHhLTQaPr4LErrvbAuGE62yPpDoRwrob",
    "script": "4f8f588fc9bd7304dc73a14c5d3d0813e048986465e22587e3166ce04225a756",
    "confirmed": 0,
    "error": ""
}, {
    "address": "1NQKomMAEPEq6jSdpRNFRjcKPvVvhUL33f",
    "script": "c0f739302655f27531f70206e5f47dcfc22e8bdae6bcb143d62cef90040c2f9e",
    "confirmed": 305718273076,
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "3MqUP6G1daVS5YTD8fz3QgwjZortWwxXFd",
    "script": "d9d46113eb0f3759c0dabf23b87b58a4c76a0633d13add20922cc5f6ede8ddd9",
    "confirmed": 56555981260,
    "error": ""
}, {
    "address": "1DPexcq8rkPn5mXV6hPr9mpL3b5j26JG4N",
    "script": "8722be669964f355ced09afef9d40cefbc49fe96121c78d1405ce0857d77624e",
    "confirmed": 4382070173,
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Get Unconfirmed History

This endpoint retrieves unconfirmed transactions for a given address. Returns up to 100k results in one request.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/bsv/<network>/address/<address>/unconfirmed/history
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4/unconfirmed/history"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5/unconfirmed/history"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "result": [{
        "tx_hash": "2fde4146ae470efb337395987261b028c38e4e095b44ae3bc800c4073daf4730"
    }, {
        "tx_hash": "3570f77cc006b507b4198370b0f97adbbdf3a83c84fe3b72c1cb0579ec34ca9f"
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
| address   | Address.                            |

## Bulk Unconfirmed History

This endpoint retrieves  the history of unconfirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 100 items returned per request.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/unconfirmed/history
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/unconfirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4\", \"1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ\"] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/unconfirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5\", \"bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8\"] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "1QC6bjxvSBdiHqGM48t5RxjTEYW6BX4vu4",
    "script": "f80a9ad71e1f2a5e83bfddb639e87e0c0bdeefd6f1b4f760dd0f88ccae3a8441",
    "result": [{
        "tx_hash": "36f1ed66752c78c6d1e8e73a060002b056015ef646e01508e8802bd8cb180b2d"
    }, {
        "tx_hash": "2cd3963137335c982005fae40846c269cf022061cae0a28f7bccf6d53a0252c6"
    },
    ...
    ],
    "nextPageToken": "890dc80865d1259528b1ec07e82d02efb77f1bcd9dbd714874bf1d00a54106f5",
    "error": ""
}, {
    "address": "1AyWnLhRYqt5VcGvVmXpieCbY3agHk53cJ",
    "script": "a6595fcfa6ac7870f3caa04633b5d60dbbb219ecdd75fc09e0f790f35bc161bd",
    "result": [{
        "tx_hash": "2fde4146ae470efb337395987261b028c38e4e095b44ae3bc800c4073daf4730"
    }, {
        "tx_hash": "3570f77cc006b507b4198370b0f97adbbdf3a83c84fe3b72c1cb0579ec34ca9f"
    },
    ...
    ],
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}, {
    "address": "bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8",
    "script": "9ed63d5c4771581e454f3343de70e5d7967832dc3de1f8002d3d8a89dc23cec3",
    "result": [{
        "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
    }],
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |

## Get Confirmed History

This endpoint retrieves confirmed transactions for a given address. Pagination is available using the provided `next-page` token.

{% code title="HTTP Request" %}

```
GET https://api.whatsonchain.com/v1/<chain>/<network>/address/<address>/confirmed/history
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/bsv/main/address/1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h/confirmed/history"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request GET "https://api.whatsonchain.com/v1/btc/main/address/bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594/confirmed/history"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
{
    "address": "1Dbj1LUxTqtuZ1U52KZiZChLPHkTAMiD6h",
    "script": "0374d9ee2df8e5d7c5fd8359f33456996f2a1a9c76d9c783d2f8d5ee05ba5832",
    "result": [{
        "tx_hash": "6cc9631ef3dad77eb0141134167f20469d0b4e61405de57fe6a9ac71b943bb9f",
        "height": 797518
    }],
    "error": ""
}
```

{% endtab %}

{% tab title="BTC" %}

```json
{
    "address": "bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594",
    "script": "81e6f015f6ad293f6eb863f76bf2d3b53722974d3b040cb397030164102eb2f0",
    "result": [{
        "tx_hash": "705ecc93d7a9866b5a42b7d67802824d1f901ee782099c46dd7c1c40b2d1a8a7",
        "height": 770399
    }, {
        "tx_hash": "972185013aac0a709c426ec26c1cdf48a5baa34ae386d969e9b83ede7642b644",
        "height": 770679
    },
    ...
    ],
    "error": ""
}
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter         | Description                                        |
| ----------------- | -------------------------------------------------- |
| chain             | Desired blockchain: `bsv` or `btc`.                |
| network           | Selected network: `main` or `test`.                |
| address           | Address.                                           |
| order             | Ordering: `asc` or `desc` (default).               |
| limit (optional)  | Between `1` and `1000`; default is `100`.          |
| height (optional) | Starting block height for history; default is `0`. |
| token             | Provided `next-page` token.                        |

## Bulk Confirmed History

This endpoint retrieves  the history of confirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 20 items returned per request.
* For pagination please use the single address endpoint.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/<chain>/<network>/addresses/confirmed/history
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ...
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/confirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP\", \"1CQuHnTR1HExx9KBvwuzeERx7CZmVkFtPs\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/confirmed/history" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594\", \"3PWuL3LkpvUwPYQw43h1oAuFkBc2x8EFr6\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP",
    "script": "c7713679ea48e31aec663612f5cbaeb86f9241677c0397b42d957545b47ca2fe",
    "result": [{
        "tx_hash": "6216506e2b5ef029595e1b29a20c279889873a9da4e98bcb5c619a4756ab6932",
        "height": 658093
    }, {
        "tx_hash": "df860638d1530d2ba1f25d167fa24bbef3b1387e94207ee5e11fa535413aff39",
        "height": 658093
    }],
    "error": ""
}, {
    "address": "1CQuHnTR1HExx9KBvwuzeERx7CZmVkFtPs",
    "script": "6b854b53cdea2cca701bb62d792b1dbbbf9e84f6049f93afe17734b5bc4ab08f",
    "result": [{
        "tx_hash": "817bc35394ce8ad598d7dfe37efc01f719bc1caa079d7f83ea3c51254af40277",
        "height": 666566
    }, {
        "tx_hash": "b781592ecb45b7587729e7e7b764e6e369f0259b3323470292c004410a4e0ddb",
        "height": 666566
    },
    ...
    ],
    "nextPageToken": "00000000de0000004c00000001000000400000003662383534623533636465613263636137303162623632643739326231646262626639653834663630343966393361666531373733346235626334616230386601180000000200000004000000000a2bc60400000000005f4cebffffff4b40922badad1114d77dbb7f48be9882010000003900000001190000001400000001000000080000009923897a084cde8f0101190000001400000001000000080000009923897a084cde8f010101000000ed4bed6135c0ae12f382dd544c57ef9a010000000000ffffffff000000000002",
    "error": ""
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "bc1q6yxjfhj94w5ej79nvuls9fsyt33k8knp8yu594",
    "script": "81e6f015f6ad293f6eb863f76bf2d3b53722974d3b040cb397030164102eb2f0",
    "result": [{
        "tx_hash": "e5f8afed665da723421226c1d8d7c9e78dffaff0215d09d38041ee951ee5bed0",
        "height": 899701
    }, {
        "tx_hash": "16b6e3a92cc549a7b392f3ce703201b7b4c14621fc1d2629f8ef29c4648a02da",
        "height": 858541
    },
    ...
    ],
    "error": ""
}, {
    "address": "3PWuL3LkpvUwPYQw43h1oAuFkBc2x8EFr6",
    "script": "b57c68f5c74e4c58cce13c93d9c8356f9c23bdcb8cd9e6de07f9e1530db6ae28",
    "result": [{
        "tx_hash": "5eb4cd7446cc5aff11f3154eac6876dd6d9fc7167e1d3d8a48078b07f761f1ad",
        "height": 848507
    }, {
        "tx_hash": "ce1a42ec6ce4ed712f86b518eeb4201af26e16918387d3d0d8ae4ad7f874bbfd",
        "height": 847976
    },
    ...
    ],
    "nextPageToken": "00000000de0000004c00000001000000400000006235376336386635633734653463353863636531336339336439633833353666396332336264636238636439653664653037663965313533306462366165323801180000000200000004000000000cf27b040000000000024bebffffff794de2f3d61b0fda5d1dc1c8398b9390010000003900000001190000001400000001000000080000002890c2ca153d9e520101190000001400000001000000080000002890c2ca153d9e52010101000000164715117e017b366640b372f29546ae010000000000ffffffff000000000002",
    "error": ""
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| chain     | Desired blockchain: `bsv` or `btc`. |
| network   | Selected network: `main` or `test`. |

## Bulk History

This endpoint retrieves  the history of both confirmed and unconfirmed transactions for a given set of addresses.

{% hint style="info" %}

* Max 20 addresses per request.
* Max 1000 confirmed and max 1000 unconfirmed history items returned per request.
* Page tokens provided if address contains more items than above.
* Call standard individual [unconfirmed](#get-unconfirmed-history-beta) and [confirmed](#get-confirmed-history-beta) endpoints with page token for more history if required.
  {% endhint %}

{% code title="HTTP Request" %}

```
POST https://api.whatsonchain.com/v1/bsv/<network>/addresses/history/all
```

{% endcode %}

{% code title="Request Data" %}

```json
{
    "addresses": [
        "<address>",
        "<address>",
        ..
    ]
}
```

{% endcode %}

#### Example Request

{% tabs %}
{% tab title="BSV" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/bsv/main/addresses/history/all" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP\", \"19SsDUJ29XM2VDCkZKnTXJ9Zjt3gMtnrwC\" ] }"
```

{% endtab %}

{% tab title="BTC" %}

```sh
curl --location --request POST "https://api.whatsonchain.com/v1/btc/main/addresses/history/all" \
  --header "Content-Type: application/json" \
  --data "{\"addresses\" : [ \"16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5\", \"bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8\" ] }"
```

{% endtab %}
{% endtabs %}

#### Example Response

{% tabs %}
{% tab title="BSV" %}

```json
[{
    "address": "16ZBEb7pp6mx5EAGrdeKivztd5eRJFuvYP",
    "script": "c7713679ea48e31aec663612f5cbaeb86f9241677c0397b42d957545b47ca2fe",
    "unconfirmed": {
        "result": [],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "6216506e2b5ef029595e1b29a20c279889873a9da4e98bcb5c619a4756ab6932",
            "height": 658093
        }, {
            "tx_hash": "df860638d1530d2ba1f25d167fa24bbef3b1387e94207ee5e11fa535413aff39",
            "height": 658093
        }],
        "error": ""
    }
}, {
    "address": "19SsDUJ29XM2VDCkZKnTXJ9Zjt3gMtnrwC",
    "script": "9ad0daaac33264199ce40596970c5ccf0096eb05b9b020002a3f1c2202841ef9",
    "unconfirmed": {
        "result": [],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "06f978c8758b45aa298e74d2951123811da06d9b22ad433fcaeceb90fb3db6cd",
            "height": 825487
        }, {
            "tx_hash": "064cad8a9ff3caad45579ee514d6a352f402ab02ed355bc9d4f9fce3eac07813",
            "height": 825488
        }],
        "error": ""
    }
}]
```

{% endtab %}

{% tab title="BTC" %}

```json
[{
    "address": "16AvgD6VzCkQaJEgTAJrERt1f9RSuJ9Dg5",
    "script": "02f81194bd8a705cb6edf1da950400e51e65f052f06380133504839d4b5cbc36",
    "unconfirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
        }],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308",
            "height": 905522
        }],
        "error": ""
    }
}, {
    "address": "bc1qww3yxs7cx3hce445azx965se5msk6x6tqqfmq8",
    "script": "9ed63d5c4771581e454f3343de70e5d7967832dc3de1f8002d3d8a89dc23cec3",
    "unconfirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308"
        }],
        "error": ""
    },
    "confirmed": {
        "result": [{
            "tx_hash": "ac69c967982a0dcd9a3d2ef99b52f5b4dfd0f0d9eb0b44d1744d92cf79ba2308",
            "height": 905522
        }],
        "error": ""
    }
}]
```

{% endtab %}
{% endtabs %}

**URL Parameters**

| Parameter | Description                         |
| --------- | ----------------------------------- |
| network   | Selected network: `main` or `test`. |
