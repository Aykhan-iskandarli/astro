export default class PlaceModel {
    public id: number | null = null;
    public name: string | null = null;
    public admin1: string | null = null;
    public countryCode: string | null = null;
    public country: string | null = null;
    public latitude: number | null = null;
    public longitude: number | null = null;
    public timezone: string | null = null;

    constructor(item: any) {
        this._setId(item);
        this._setName(item);
        this._setAdmin1(item);
        this._setCountryCode(item);
        this._setCountry(item);
        this._setLatitude(item);
        this._setLongitude(item);
        this._setTimezone(item);
    }

    private _setId({id}: any) {
        this.id = id ?? null;
    }

    private _setName({name}: any) {
        this.name = name ?? null;
    }

    private _setAdmin1({admin1}: any) {
        this.admin1 = admin1 ?? null;
    }

    private _setCountryCode({countryCode}: any) {
        this.countryCode = countryCode ?? null;
    }

    private _setCountry({country}: any) {
        this.country = country ?? null;
    }

    private _setLatitude({latitude}: any) {
        this.latitude = latitude ?? null;
    }

    private _setLongitude({longitude}: any) {
        this.longitude = longitude ?? null;
    }

    private _setTimezone({timezone}: any) {
        this.timezone = timezone ?? null;
    }
}
