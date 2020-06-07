<a href="readme.html">English</a> | Русский

***

# Библиотека круговых интерфейсов

Round Interfaces Library - это коллекция классов графических объектов для построения круговых интерфейсов пользователя.  

![Plain Color Interface](docs/images/plain_color_interface.png)
![Hi-Tech Interface](docs/images/hi_tech_interface.png)
![Futuristic Interface](docs/images/futuristic_interface.png)

## Назначение библиотеки 

Круговые интерфейсы могут применяться с целью:  

* разнообразить дизайн проекта или продукта;  
* обеспечить компактность при визуализации информации;  
* получить виртуальный вариант физических интерфейсов управления или измерительных приборов.  

Данная библиотека разрабатывается с целью упростить процесс проектирования и реализации круговых интерфейсов.  

Например, ключевой элемент кругового интерфейса - сегмент кольца - можно создать в несколько строк кода:

![Futuristic Interface](docs/images/segment.png)

>
    HTML:  
>>
    <canvas id="segment" width="200" height="200">
        <div>Use a canvas-compatible browser</div>
    </canvas>
>
    JS:  
>>
    let canvas = document.getElementById('segment');
    let context = canvas.getContext('2d');
    context.width = canvas.width;
    context.height = canvas.height;
    let cx = context.width/2;
    let cy = context.height/2;
>>
*let seg = new Segment('seg-1', context, cx, cy, 50, 20, -90, 90);*  
*seg.draw();*  

## Средства реализации  

Библиотека написана на языке JavaScript.  
Для отрисовки графических элементов используется HTML элемент Canvas.  

Документация на английском и русском языках поставляется в составе библиотеки в форматах HTML и MD.  
Для использования библиотеки необходимы базовые знания HTML и JavaScript.  

## Структура файлов и папок проекта  

> *js* - основная папка с файлами библиотеки. Для использования библиотеки в собственном проекте достаточно подключить эти файлы.  

> *docs* - папка с документацией в .html формате. Документация приведена на английском и русском языках.    
> *docs-dev* - папка с документацией в .md формате для исправления ошибок, доработки и использования в собственных проектах.  

> *examples* - папка с примерами использования базовых графических объектов.  
> *gui-examples-js* - папка с примерами реализации интерфейсов пользователя, составленных из базовых графических объектов.  

<a href="examples/gui-examples.html" target="_blank">Примеры</a> описывают способы построения формы и анимации круговых интерфейсов.  

> *css* - папка с файломи стилей для оформления примеров.  
> *svg* - папка с векторными изображениями для оформления примеров.

## Базовые элементы круговых интерфейсов (реализовано в 1-й версии библиотеки)

1. <a href="docs/ru/segment.ru.html">Segment</a> - Сегмент
2. <a href="docs/ru/segment-level.ru.html">SegmentLevel</a> - Уровень сегментов
3. <a href="docs/ru/segment-array.ru.html">SegmentArray</a> - Массив сегментов
4. <a href="docs/ru/segment-dot.ru.html">SegmentDot</a> - Сегментная точка
5. <a href="docs/ru/segment-dots-array.ru.html">SegmentDotsArray</a> - Сегментный массив точек
6. <a href="docs/ru/segment-scale-mark.ru.html">SegmentScaleMark</a> - Отметка сегментной шкалы
7. <a href="docs/ru/segment-scale.ru.html">SegmentScale</a> - Сегментная шкала
8. <a href="docs/ru/segment-gradient.ru.html">SegmentGradient</a> - Сегментный градиент
9. <a href="docs/ru/utilities.ru.html">Utilities</a> - Утилиты библиотеки

## Круговые элементы управления (запланировано к реализации во 2-й версии библиотеки)  

1. Progress Bar - Индикатор прогресса  
2. Timer - Таймер  
3. Volume - Громкость  
4. Equalizer - Эквалайзер  
5. Captcha - Тест, позволяющий различать компьтеры и людей
6. Measuring Instruments - Измерительные приборы с круговой шкалой
7. Chart - Диаграмма
8. Radar - Радар

## Круговые интерфейсы управления графикой (запланировано к реализации в 3-й версии библиотеки)  

1. Icon Manager - Менеджер иконок  
2. Image Gallery - Галерея изображений
3. Round Interfaces Editor - Редактор круговых интерфейсов

## Лицензия  
Настояющую библиотеку можно использовать и дорабатывать в коммерческих, образовательных и личных целях.  
Сообщения об ошибках и рекомендации по доработке можно направлять на электронную почту автора.  

## О библиотеке
Версия: 1.0

## Об авторе  
Автор: Игорь Тиунов  
E-mail: igor@tiunovs.com  