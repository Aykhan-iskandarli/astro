import {useCallback, useMemo, useState} from 'react';
import {AutoComplete, Button, Checkbox, DatePicker, Form, Input, Select, TimePicker} from 'antd';
import type {CheckboxChangeEvent} from 'antd/es/checkbox';
import dayjs, {Dayjs} from 'dayjs';
import {useStore} from 'store/store.config';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import useLocalization, {useContent} from 'assets/lang';
import {useGetPlaces} from '../../actions/natal-chart.query';
import PlaceModel from '../../models/place.model';
import {useBirthFormStyles} from './birth-form.style';
import {IBirthForm, IBirthFormValues} from './birth-form';

const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

const BirthFormComponent = ({initialValue, loading, onSubmit, submitLabel, showNote = true}: IBirthForm) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const {form: formClass, row, note, submit, optionBox, optionHint} = useBirthFormStyles();
    const [form] = Form.useForm<IBirthFormValues>();

    const initialPlace = useMemo(() => (initialValue ? new PlaceModel({
        name: initialValue.place, latitude: initialValue.latitude, longitude: initialValue.longitude,
        timezone: initialValue.timezone,
    }) : null), [initialValue]);

    const [placeQuery, setPlaceQuery] = useState('');
    const [place, setPlace] = useState<PlaceModel | null>(initialPlace);
    const [timeUnknown, setTimeUnknown] = useState<boolean>(initialValue ? initialValue.time === null : false);
    const debouncedQuery = useDebouncedValue(placeQuery, 250);
    const {data: places, isFetching} = useGetPlaces(debouncedQuery);

    const regionNames = useMemo(() => {
        try {
            return new Intl.DisplayNames([locale], {type: 'region'});
        } catch {
            return null;
        }
    }, [locale]);

    const placeLabel = useCallback((p: PlaceModel) => {
        const country = (p.countryCode && regionNames?.of(p.countryCode)) || p.country;
        return [p.name, p.admin1 !== p.name ? p.admin1 : null, country].filter(Boolean).join(', ');
    }, [regionNames]);

    const options = useMemo(() => (places ?? []).map((p) => ({
        value: String(p.id),
        label: placeLabel(p),
    })), [places, placeLabel]);

    const handlePlaceSearch = useCallback((value: string) => {
        setPlaceQuery(value);
        setPlace(null);
    }, []);

    const handlePlaceSelect = useCallback((value: string) => {
        const selected = places?.find((p) => String(p.id) === value) ?? null;
        setPlace(selected);
        if (selected) form.setFieldValue('place', placeLabel(selected));
        form.validateFields(['place']);
    }, [places, form, placeLabel]);

    const handleTimeUnknown = useCallback((e: CheckboxChangeEvent) => {
        setTimeUnknown(e.target.checked);
        if (e.target.checked) form.setFieldValue('time', undefined);
        form.validateFields(['time']);
    }, [form]);

    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const placeValidator = useCallback(() => (
        place ? Promise.resolve() : Promise.reject(new Error(translate('required_place')))
    ), [place, translate]);

    const handleFinish = useCallback((values: IBirthFormValues) => {
        if (!place || !values.date) return;
        onSubmit({
            name: values.name?.trim() || null,
            date: values.date.format('YYYY-MM-DD'),
            time: timeUnknown || !values.time ? null : values.time.format('HH:mm'),
            latitude: place.latitude!,
            longitude: place.longitude!,
            timezone: place.timezone!,
            place: values.place ?? place.name ?? '',
            houseSystem: values.houseSystem,
        });
    }, [place, timeUnknown, onSubmit]);

    const houseSystems = useMemo(() => ([
        {value: 'P', label: `${content.houseSystems.placidus} (${translate('house_system_recommended')})`, hint: translate('house_system_p_hint')},
        {value: 'K', label: content.houseSystems.koch, hint: translate('house_system_k_hint')},
        {value: 'W', label: content.houseSystems.wholeSign, hint: translate('house_system_w_hint')},
        {value: 'A', label: content.houseSystems.equal, hint: translate('house_system_a_hint')},
    ]), [content, translate]);

    const renderHouseOption = useCallback((option: {data: {label: string; hint: string}}) => (
        <div className={optionBox}>
            <span>{option.data.label}</span>
            <span className={optionHint}>{option.data.hint}</span>
        </div>
    ), [optionBox, optionHint]);

    const initialValues: IBirthFormValues = useMemo(() => ({
        name: initialValue?.name ?? undefined,
        date: initialValue ? dayjs(initialValue.date) : undefined,
        time: initialValue?.time ? dayjs(`2000-01-01T${initialValue.time}`) : undefined,
        timeUnknown: initialValue ? initialValue.time === null : false,
        place: initialValue?.place,
        houseSystem: initialValue?.houseSystem ?? 'P',
    }), [initialValue]);

    return (
        <Form<IBirthFormValues>
            form={form}
            layout='vertical'
            requiredMark={false}
            className={formClass}
            initialValues={initialValues}
            onFinish={handleFinish}
            size='large'
        >
            <Form.Item name='name' label={translate('field_name')}>
                <Input placeholder={translate('field_name_placeholder')} maxLength={80} autoComplete='off'/>
            </Form.Item>

            <div className={row}>
                <Form.Item name='date' label={translate('field_date')}
                           rules={[{required: true, message: translate('required_date')}]}>
                    <DatePicker format='DD.MM.YYYY' placeholder={translate('field_date_placeholder')}
                                disabledDate={disabledDate} style={{width: '100%'}} inputReadOnly={false}/>
                </Form.Item>
                <Form.Item name='time' label={translate('field_time')}
                           rules={[{required: !timeUnknown, message: translate('required_time')}]}>
                    <TimePicker format='HH:mm' placeholder={translate('field_time_placeholder')} disabled={timeUnknown}
                                style={{width: '100%'}} needConfirm={false}/>
                </Form.Item>
            </div>

            <Form.Item name='timeUnknown' valuePropName='checked' extra={timeUnknown ? translate('field_time_unknown_help') : null}>
                <Checkbox onChange={handleTimeUnknown}>{translate('field_time_unknown')}</Checkbox>
            </Form.Item>

            <Form.Item name='place' label={translate('field_place')} rules={[{validator: placeValidator}]}>
                <AutoComplete
                    options={options}
                    onSearch={handlePlaceSearch}
                    onSelect={handlePlaceSelect}
                    placeholder={translate('field_place_placeholder')}
                    notFoundContent={debouncedQuery.length >= 2 ? (isFetching ? translate('place_searching') : translate('place_no_results')) : null}
                />
            </Form.Item>

            <Form.Item name='houseSystem' label={translate('field_house_system')} extra={translate('field_house_system_help')}>
                <Select options={houseSystems} optionRender={renderHouseOption} listHeight={400}/>
            </Form.Item>

            <Button type='primary' htmlType='submit' size='large' block loading={loading} className={submit}>
                {submitLabel ?? translate('submit_chart')}
            </Button>
            {showNote ? <p className={note}>{translate('privacy_note')}</p> : null}
        </Form>
    );
};

export default BirthFormComponent;
