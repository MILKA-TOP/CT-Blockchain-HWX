# ДЗ №X К курсу "Блокчейн" 

## Выполнил работу Миленин Иван (M33351)


**Задание:**
- Реализовать проект на выбранную тему

___________________

## Запуск

Для запуска необходимо прописать следующую команду

```
$  npx hardhat test test/Token.js
```
___________________

## О коде:

Изначальная идея проекта описывалась здесь: https://github.com/MILKA-TOP/CT-Blockchain-HW2

Если в кратце, то планировалось реализовать контракт-аукцион, но для того, чтобы "выделиться" 
планировалось сделать интересный вариант "оставшегося времени". 

Далее я стал реализовывать контракт и передо мной встал вопрос, а что сделать лучше:
- Один контракт для одного аукциона (пользователь сам создает контракт под себя)
- Сделать возможность пользователям использовать уже готовый контракт, в котором будет ограниченно 
количество слотов под одновременно-идущие аукционы.

С одной стороны первый случай тратит гораздо больше газа, с другой наличие собственного контракта расширяет возможности 
по его кастомизации.

Тогда было принято решение написать 2 этих контракта, имеющих под собой один абстрактный класс с едиными ивентами и какими-то функциями.

Однако встал вопрос а тогда какое будет преимущество между обычным контрактом для одного аукциона и ктонтрактом для нескольких аукционов?

Немного подумав я решил сделать следующее:
- При создании собственного контракта пользователь может самостоятельно выбрать минимальное и максимальное время, которое будет оставаться
между приемом новых заявок на покупку предмета (платить газом будут больше) 
- У контракта с ограничением по количеству будет статическое время, выставляемое создателем контракта при его создании. Также создатель может выставить количество одновременных ячеек, которые могут одновременно проводить аукцион.











## Пример вывода:

```
$ npx hardhat test test/Token.js


  Token contract
    Single bidding test
        -| time left (sec.): 85800
        -| time pass (sec.): 86400
        -| bidding status: CANCEL
      √ 1 payments | ErrorType: timeout | Result: Cancel (142ms)
        -| owner balance: 9999991466907051509830
        -| time left (sec.): 85800
        -| addr1 buy item with this price: 1000
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 85200
        -| time pass (sec.): 86400
        -| bidding status: ACCEPT
        -| owner/price: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8/1000
        -| previous owner's balance: 9999991466907051510830
      √ 2 payments | ErrorType: _ | Result: Accepted (197ms)
        -| time left (sec.): 85800
        -| addr1 buy item with this price: 1000
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 85200
        -| addr2 buy item with this price: 2000
        -| current owner: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        -| time left (sec.): 84600
        -| time pass (sec.): 86400
        -| bidding status: ACCEPT
        -| owner/price: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC/2000
        -| previous owner's balance: 9999988223833000916625
      √ 3 payments | ErrorType: _ | Result: Accepted (138ms)
        -| addr1 buy item with this price: 200
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 85200
        -| addr1 buy item with this price: 220
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 84600
        -| addr1 buy item with this price: 240
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 83400
        -| addr1 buy item with this price: 260
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 81600
        -| addr1 buy item with this price: 280
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 78600
        -| addr1 buy item with this price: 300
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 73800
        -| addr1 buy item with this price: 330
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 66000
        -| addr1 buy item with this price: 360
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 53400
        -| addr1 buy item with this price: 390
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 33000
        -| addr1 buy item with this price: 460
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 600
        -| addr1 buy item with this price: 500
        -| current owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        -| time left (sec.): 600
        -| time pass (sec.): 86400
        -| bidding status: ACCEPT
        -| owner/price: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8/460
      √ `n` payments | ErrorType: _ | Result: Accepted (504ms)
    Multi bidding test
        -| Create new bidding with this hashId: 100
        -| time pass (sec.): 86400
        -| hashId: 100 | bidding status: CANCEL
      √ 1 create | (0 payments, _ , _ ) | Result: Cancel (69ms)
        -| Create new bidding with this hashId: 100
        -| addr2 buy item with hashId=100 with this price: 200
        -| current owner of item with hashId= 100: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        -| time pass (sec.): 86400
        -| hashId: 100 | bidding status: APPOVE | price: 200
      √ 1 create | (1 payments, _ , _ ) | Result: Accept (77ms)
        -| Create new bidding with this hashId: 100
        -| addr2 buy item with hashId=100 with this price: 200
        -| current owner of item with hashId= 100: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        -| addr3 buy item with hashId=100 with this price: 300
        -| current owner of item with hashId= 100: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
        -| time pass (sec.): 86400
        -| hashId: 100 | bidding status: APPOVE | price: 300
      √ 1 create | (2 payments, _ , _ ) | Result: Accept (143ms)
        -| Create new bidding with this hashId: 100
        -| time pass (sec.): 300
        -| Create new bidding with this hashId: 200
        -| time pass (sec.): 400
        -| hashId: 100 | bidding status: CANCEL
        -| time pass (sec.): 600
        -| hashId: 200 | bidding status: CANCEL
      √ 2 create | (0 payments, 0 payments , _ ) | Result: Cancel (137ms)
        -| Create new bidding with this hashId: 100
        -| time pass (sec.): 240
        -| Create new bidding with this hashId: 200
        -| time pass (sec.): 240
        -| addr3 buy item with hashId=100 with this price: 2000
        -| time pass (sec.): 420
        -| hashId: 100 | bidding status: CANCEL
        -| time pass (sec.): 600
        -| hashId: 100 | bidding status: APPOVE | price: 2000
      √ 2 create | (1 payments, 0 payments , _ ) | Result: (Accept | Cancel) (135ms)
      √ 2 create | (2 payments, 0 payments , _ ) | Result: (Accept | Cancel) (171ms)
      √ 4 create | (0 payments, 0 payments , 0 payments ) | Result: (Cancel | Cancel | Cancel) (192ms)


  11 passing (12s)

npm notice
npm notice New major version of npm available! 8.15.0 -> 9.3.1
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.3.1>
npm notice Run `npm install -g npm@9.3.1` to update!
npm notice


```

