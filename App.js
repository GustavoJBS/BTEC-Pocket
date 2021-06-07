import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Alert, Button, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.disableYellowBox = true;
export default function App() {
  const [WalletAddress, setWalletAddress] = useState("")
  const [saldoConta, setSaldoConta] = useState("")
  const [valorReal, setValorReal] = useState("")
  const [valorDolar, setValorDolar] = useState(0)
  const [valorBnB, setValorBnB] = useState(0)
  const [valorMaximoCirculacao, setValorMaximoCirculacao] = useState()
  const [tokensQueimados, setTokensQueimados] = useState()
  const [saldoDolar, setSaldoDolar] = useState((saldoConta / 1000000000) * (valorDolar * valorBnB))
  const [saldoReal, setSaldoReal] = useState((saldoConta / 1000000000) * (valorDolar * valorBnB))
  const [saldoBnB, setSaldoBnB] = useState((saldoConta / 1000000000) * (valorDolar * valorBnB))




  useEffect(() => {
    async function endereço() {
      const value = await AsyncStorage.getItem("saldoCarteira");
      if (value) {
        setWalletAddress(value)
      }
      forceUpdate()
      console.log(value)
    }
    endereço()
    MaximoCirculacao()
    Circulacao()
    ValorUSD()
    ValorBNB()
    ValorBRL()
  }, [])

  useEffect(() => {
    if (WalletAddress !== "") {
      SaldoCarteira()


    }
  }, [WalletAddress])
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    setSaldoDolar((saldoConta / 1000000000) * (valorDolar * valorBnB))
    setSaldoReal((saldoConta / 1000000000) * (valorDolar * valorBnB * valorReal))
    setSaldoBnB((saldoConta / 1000000000) * (valorBnB))
  }, [valorReal, valorDolar, valorBnB
  ])
  const SaldoCarteira = () => {
    axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0xD890661EF4f88452265D36a290Fa09aC476C2020&address=${WalletAddress}&tag=latest&apikey=RIDWPI57J2AWWNJCV66R1TQF2W45J7SP1W`).then(async (response) => {
      if (response.data.result == "0") {
        ToastAndroid.show("Carteira não encontrada", 2000)
        setSaldoConta(0)
        setSaldoDolar(0)
        setSaldoReal(0)
        setSaldoBnB(0)
        return false
      }
      await setSaldoConta(response.data.result)
      ToastAndroid.show("Carregando Informações...", 4000)
    })
  }

  const ValorBNB = () => {
    axios.post("https://chartdata.poocoin.app/", {
      "query": "query GetCandleData(\n  $baseCurrency: String!,\n  $since: ISO8601DateTime,\n  $till: ISO8601DateTime,\n  $quoteCurrency: String!,\n  $exchangeAddresses: [String!]\n  $minTrade: Float\n  $window: Int) {\n    ethereum(network: bsc) {\n        dexTrades(\n            options: {asc: \"timeInterval.minute\"}\n            date: {since: $since, till: $till}\n            exchangeAddress: {in: $exchangeAddresses}\n            baseCurrency: {is: $baseCurrency}\n            quoteCurrency: {is: $quoteCurrency} # WBNB\n            tradeAmountUsd: {gt: $minTrade}\n        ) {\n            timeInterval {\n                minute(count: $window, format: \"%Y-%m-%dT%H:%M:%SZ\")\n            }\n            baseCurrency {\n                symbol\n                address\n            }\n            quoteCurrency {\n                symbol\n                address\n            }\n\n            tradeAmount(in: USD)\n            trades: count\n            quotePrice\n            maximum_price: quotePrice(calculate: maximum)\n            minimum_price: quotePrice(calculate: minimum)\n            open_price: minimum(of: block, get: quote_price)\n            close_price: maximum(of: block, get: quote_price)\n        }\n    }\n}\n", "variables": { "baseCurrency": "0xd890661ef4f88452265d36a290fa09ac476c2020", "quoteCurrency": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "since": "2021-06-04T23:25:00.000Z", "till": new Date(), "window": 1, "exchangeAddresses": ["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"], "minTrade": 10 },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Authorization"
      }
    }).then((response) => {
      const tamanhoArray = response.data.data.ethereum.dexTrades.length
      setValorBnB(response.data.data.ethereum.dexTrades[tamanhoArray - 1].quotePrice)


    })
  }

  const ValorUSD = () => {
    axios.get("https://www.binance.com/api/v3/depth?symbol=BNBUSDT&limit=1000").then((response) => {
      setValorDolar(response.data.asks["0"]["0"])
    })
  }

  const ValorBRL = () => {
    axios.get("https://economia.awesomeapi.com.br/json/last/USD-BRL").then((response) => {
      setValorReal(response.data.USDBRL.ask)
    })
  }

  const MaximoCirculacao = () => {
    axios.get("https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xD890661EF4f88452265D36a290Fa09aC476C2020&apikey=RIDWPI57J2AWWNJCV66R1TQF2W45J7SP1W").then((response) => setValorMaximoCirculacao(response.data.result))
  }
  const Circulacao = () => {
    axios.get("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0xD890661EF4f88452265D36a290Fa09aC476C2020&address=0x000000000000000000000000000000000000dead&tag=latest&apikey=RIDWPI57J2AWWNJCV66R1TQF2W45J7SP1W").then((response) => setTokensQueimados(response.data.result))
  }


  const salvarCarteira = async () => {
    await AsyncStorage.setItem("saldoCarteira", WalletAddress)
  }


  const Atualizar = () => {
    SaldoCarteira()
    ValorBNB()
    ValorUSD()
    ValorBRL()
    MaximoCirculacao()
    Circulacao()
    forceUpdate()
  }
  return (
    <ScrollView >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View></View>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginLeft: 60 }}>BTEC POCKET</Text>
          <TouchableOpacity onPress={() => {
            Atualizar()
          }} style={{ padding: 20 }} >
            <Icon size={25} style={{ color: '#fff' }} name="repeat" />
          </TouchableOpacity>



        </View>
        <Image style={styles.imagem} source={{
          uri: 'https://secureservercdn.net/104.238.68.196/qx5.f0e.myftpupload.com/wp-content/uploads/2021/05/logo-braziltech.png',
        }} />

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 40, marginBottom: 20 }}>Endereço da Carteira</Text>
          <TextInput style={[styles.input, { marginTop: -10 }]} value={WalletAddress} onBlur={() => { salvarCarteira(); Atualizar() }} placeholder="Digite o endereço da sua Carteira BTEC" onChangeText={text => { setWalletAddress(text); forceUpdate() }} />
        </>

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 40, marginBottom: 20 }}>Saldo em BTEC:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={(saldoConta / 1000000000).toLocaleString('pt-BR') + " BTEC"} editable={false} />
        </>


        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Saldo em Dólar:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={saldoDolar.toLocaleString('pt-BR') + " $"} editable={false} />
        </>


        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Saldo em Real:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={saldoReal.toFixed(4).toLocaleString('pt-BR') + " R$"} editable={false} />
        </>

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Saldo em BnB</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={saldoBnB.toLocaleString('pt-BR') + " BNB"} editable={false} />
        </>

        <View style={[styles.box, { backgroundColor: '#565656' }]}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>

            <Image style={{ width: 60, height: 60, marginTop: 10, marginLeft: 20 }} resizeMode="contain" source={{ uri: "https://image.flaticon.com/icons/png/512/32/32665.png" }} />

            <View>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#000" }}>Real</Text>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#000" }}>BRL</Text>
            </View>
          </View>
          <Text style={{ marginBottom: 10, marginLeft: 20, fontWeight: 'bold', fontSize: 16, color: "#000" }}>1 BTEC vale: {parseFloat(valorDolar * valorBnB * valorReal).toFixed(6)} R$</Text>
        </View>

        <View style={[styles.box, { backgroundColor: '#565656' }]}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>

            <Image style={{ width: 60, height: 60, marginTop: 10, marginLeft: 20 }} resizeMode="contain" source={{ uri: "https://image.flaticon.com/icons/png/512/126/126179.png" }} />

            <View>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#000" }}>Dólar</Text>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#000" }}>USD</Text>
            </View>
          </View>
          <Text style={{ marginBottom: 10, marginLeft: 20, fontWeight: 'bold', fontSize: 16, color: "#000" }}>1 BTEC vale: {parseFloat(valorDolar * valorBnB).toFixed(6)} $</Text>
        </View>

        <View style={[styles.box, { backgroundColor: '#565656', marginBottom: 20 }]}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Image style={{ width: 60, height: 60, marginTop: 10, marginLeft: 20 }} resizeMode="contain" source={{ uri: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=010" }} />

            <View>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#F3BA2F" }}>Binance Coin</Text>
              <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', fontSize: 16, color: "#F3BA2F" }}>BNB</Text>
            </View>


          </View>
          <Text style={{ marginBottom: 10, marginLeft: 20, fontWeight: 'bold', fontSize: 16, color: "#FFD83B" }}>1 BTEC vale: {parseFloat(valorBnB).toFixed(11)} BNB</Text>
        </View>

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Máximo em Circulação:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={parseFloat(valorMaximoCirculacao / 1000000000).toLocaleString('pt-BR')} editable={false} />
        </>

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Em Circulação:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={parseFloat((valorMaximoCirculacao - tokensQueimados) / 1000000000).toLocaleString('pt-BR')} editable={false} />
        </>

        <>
          <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 15, marginBottom: 20 }}>Tokens queimados:</Text>
          <TextInput style={[styles.input, { fontSize: 17, marginTop: -10 }]} value={parseFloat(tokensQueimados / 1000000000).toLocaleString('pt-BR')} editable={false} />
        </>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  topBar: {
    display: 'flex',
    backgroundColor: '#565656',
    height: 80,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#181818',
    alignItems: 'center',
    paddingBottom: 50
  },
  imagem: {
    width: 150,
    height: 150,
    marginTop: 75
  },

  input: {
    color: '#000',
    marginTop: 40,
    backgroundColor: '#565656',
    width: '92%',
    height: 40,
    borderRadius: 10,
    borderWidth: 0,
    textDecorationLine: 'none',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  box: {
    display: 'flex', width: '80%', height: 140, justifyContent: 'space-between', backgroundColor: '#565656', marginTop: 25, borderRadius: 10

  }
});
